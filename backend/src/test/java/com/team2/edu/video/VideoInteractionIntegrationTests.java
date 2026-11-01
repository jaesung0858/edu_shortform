package com.team2.edu.video;

import com.team2.edu.quiz.entity.Quiz;
import com.team2.edu.quiz.entity.QuizAttempt;
import com.team2.edu.quiz.repository.QuizAttemptRepository;
import com.team2.edu.quiz.repository.QuizRepository;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.UserVideoId;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import com.team2.edu.video.repository.VideoLikeRepository;
import com.team2.edu.video.repository.VideoRepository;
import com.team2.edu.video.service.VideoInteractionService;
import com.team2.edu.video.service.VideoStorageService;
import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VideoInteractionIntegrationTests {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired VideoRepository videos;
    @Autowired VideoLikeRepository likes;
    @Autowired QuizRepository quizzes;
    @Autowired QuizAttemptRepository attempts;
    @Autowired VideoInteractionService interactions;
    @Autowired VideoStorageService storage;
    @Autowired EntityManager entityManager;
    @Autowired PlatformTransactionManager transactionManager;

    @Test
    void likesAreIdempotentAndUseSessionMember() throws Exception {
        var owner = member();
        var learner = member();
        var other = member();
        var video = video(owner);
        String path = "/api/videos/" + video.getId() + "/like";

        mvc.perform(get(path).session(session(learner)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.liked").value(false));
        for (int i = 0; i < 2; i++) {
            mvc.perform(put(path).session(session(learner)).header("X-User-Id", other.getId()))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.liked").value(true))
                    .andExpect(jsonPath("$.likeCount").value(1));
        }
        assertThat(likes.existsById(new UserVideoId(learner.getId(), video.getId()))).isTrue();
        assertThat(likes.existsById(new UserVideoId(other.getId(), video.getId()))).isFalse();
        mvc.perform(put(path).session(session(other)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.likeCount").value(2));
        for (int i = 0; i < 2; i++) {
            mvc.perform(delete(path).session(session(learner)))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.liked").value(false))
                    .andExpect(jsonPath("$.likeCount").value(1));
        }
        mvc.perform(delete(path).session(session(other)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.likeCount").value(0));
        mvc.perform(get("/api/videos/" + video.getId()))
                .andExpect(jsonPath("$.likeCount").value(0));
    }

    @Test
    void onlyExplicitViewRequestsIncreaseCount() throws Exception {
        var video = video(member());
        String path = "/api/videos/" + video.getId();
        mvc.perform(get(path)).andExpect(status().isOk()).andExpect(jsonPath("$.viewCount").value(0));
        mvc.perform(get(path + "/content")).andExpect(status().isNotFound());
        mvc.perform(head(path + "/content")).andExpect(status().isNotFound());
        for (int i = 1; i <= 2; i++) {
            mvc.perform(post(path + "/views")).andExpect(status().isOk())
                    .andExpect(jsonPath("$.viewCount").value(i));
        }
        mvc.perform(get(path)).andExpect(jsonPath("$.viewCount").value(2));
    }

    @Test
    void requiresLoginAndValidIdsForMemberActions() throws Exception {
        String path = "/api/videos/1";
        mvc.perform(get(path + "/like").header("X-User-Id", "2")).andExpect(status().isUnauthorized());
        mvc.perform(put(path + "/like")).andExpect(status().isUnauthorized());
        mvc.perform(delete(path + "/like")).andExpect(status().isUnauthorized());
        mvc.perform(delete(path)).andExpect(status().isUnauthorized());
        var session = session(member());
        mvc.perform(put("/api/videos/0/like").session(session)).andExpect(status().isBadRequest());
        mvc.perform(delete("/api/videos/-1").session(session)).andExpect(status().isBadRequest());
        mvc.perform(post("/api/videos/abc/views")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/videos/0/views")).andExpect(status().isBadRequest());
        mvc.perform(put("/api/videos/999999999/like").session(session)).andExpect(status().isNotFound());
        mvc.perform(post("/api/videos/999999999/views")).andExpect(status().isNotFound());
    }

    @Test
    void rejectsHiddenDeletedAndRemovedCreatorsVideos() throws Exception {
        var owner = member();
        var video = video(owner);
        String path = "/api/videos/" + video.getId();
        for (VideoStatus status : List.of(VideoStatus.HIDDEN, VideoStatus.DELETED)) {
            ReflectionTestUtils.setField(video, "status", status);
            videos.saveAndFlush(video);
            mvc.perform(get(path + "/like").session(session(owner))).andExpect(status().isNotFound());
            mvc.perform(put(path + "/like").session(session(owner))).andExpect(status().isNotFound());
            mvc.perform(delete(path + "/like").session(session(owner))).andExpect(status().isNotFound());
            mvc.perform(post(path + "/views")).andExpect(status().isNotFound());
        }
        ReflectionTestUtils.setField(video, "status", VideoStatus.PUBLIC);
        ReflectionTestUtils.setField(owner, "deletedAt", LocalDateTime.now());
        users.saveAndFlush(owner);
        videos.saveAndFlush(video);
        mvc.perform(post(path + "/views")).andExpect(status().isNotFound());
        mvc.perform(put(path + "/like").session(session(member()))).andExpect(status().isNotFound());
        mvc.perform(put(path + "/like").session(session(owner))).andExpect(status().isUnauthorized());
        mvc.perform(delete(path).session(session(owner))).andExpect(status().isUnauthorized());
    }

    @Test
    void softDeleteRequiresOwnerAndPreservesFilesAndLearningRecords() throws Exception {
        var owner = member();
        var learner = member();
        byte[] bytes = {0, 0, 0, 12, 'f', 't', 'y', 'p', 'i', 's', 'o', 'm'};
        String key = storage.store(new MockMultipartFile("file", "test.mp4", "video/mp4", bytes));
        try {
            var category = categories.saveAndFlush(new Category("delete-" + suffix()));
            var tag = tags.saveAndFlush(new ConceptTag(category, "delete tag"));
            var video = videos.saveAndFlush(new Video(owner, category, tag, "delete test", "", key, 30));
            var quiz = quizzes.saveAndFlush(new Quiz(video, "문제", List.of("1", "2", "3", "4"), 1, "해설"));
            var attempt = attempts.saveAndFlush(new QuizAttempt(learner, quiz, 2));
            String path = "/api/videos/" + video.getId();
            mvc.perform(put(path + "/like").session(session(learner))).andExpect(status().isOk());
            mvc.perform(delete(path).session(session(learner))).andExpect(status().isForbidden());
            mvc.perform(delete(path).session(session(owner))).andExpect(status().isNoContent());
            entityManager.flush();
            entityManager.clear();

            assertThat(videos.findById(video.getId()).orElseThrow().getStatus()).isEqualTo(VideoStatus.DELETED);
            assertThat(quizzes.existsById(quiz.getId())).isTrue();
            assertThat(attempts.existsById(attempt.getId())).isTrue();
            assertThat(likes.existsById(new UserVideoId(learner.getId(), video.getId()))).isTrue();
            assertThat(storage.load(key).exists()).isTrue();
            mvc.perform(get(path).session(session(owner))).andExpect(status().isNotFound());
            mvc.perform(get(path + "/content")).andExpect(status().isNotFound());
            mvc.perform(get(path + "/thumbnail")).andExpect(status().isNotFound());
            mvc.perform(get(path + "/quizzes")).andExpect(status().isNotFound());
            mvc.perform(get(path + "/recommendations").session(session(learner))).andExpect(status().isNotFound());
            mvc.perform(post("/api/quizzes/" + quiz.getId() + "/answer").session(session(learner))
                            .contentType("application/json").content("{\"selectedNo\":1}"))
                    .andExpect(status().isNotFound());
            mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()))
                    .andExpect(jsonPath("$.videos").isEmpty());
            mvc.perform(get("/api/users/me/videos").session(session(owner)))
                    .andExpect(jsonPath("$.videos[*].videoId").value(not(hasItem(video.getId().intValue()))));
            mvc.perform(delete(path).session(session(owner))).andExpect(status().isNotFound());
        } finally {
            storage.delete(key);
        }
    }

    @Test
    void ownerCanDeleteHiddenVideo() throws Exception {
        var owner = member();
        var video = video(owner);
        ReflectionTestUtils.setField(video, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(video);
        mvc.perform(delete("/api/videos/" + video.getId()).session(session(owner))).andExpect(status().isNoContent());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void concurrentRequestsDoNotDuplicateLikesOrLoseCounts() throws Exception {
        var transactions = new TransactionTemplate(transactionManager);
        var fixture = transactions.execute(status -> {
            var user = member();
            var video = video(user);
            return new Fixture(user.getId(), user.getEmail(), video.getId(), video.getTag().getId(), video.getCategory().getId());
        });
        try {
            runConcurrently(fixture, () -> interactions.like(fixture.videoId(), fixture.email()));
            transactions.executeWithoutResult(status -> {
                assertThat(videos.findById(fixture.videoId()).orElseThrow().getLikeCount()).isEqualTo(1);
                assertThat(likes.existsById(new UserVideoId(fixture.userId(), fixture.videoId()))).isTrue();
            });
            runConcurrently(fixture, () -> interactions.unlike(fixture.videoId(), fixture.email()));
            runConcurrently(fixture, () -> interactions.addView(fixture.videoId()));
            transactions.executeWithoutResult(status -> {
                var video = videos.findById(fixture.videoId()).orElseThrow();
                assertThat(video.getLikeCount()).isZero();
                assertThat(video.getViewCount()).isEqualTo(4);
                assertThat(likes.existsById(new UserVideoId(fixture.userId(), fixture.videoId()))).isFalse();
            });
        } finally {
            transactions.executeWithoutResult(status -> {
                likes.findById(new UserVideoId(fixture.userId(), fixture.videoId())).ifPresent(likes::delete);
                likes.flush();
                videos.deleteById(fixture.videoId());
                videos.flush();
                tags.deleteById(fixture.tagId());
                tags.flush();
                categories.deleteById(fixture.categoryId());
                users.deleteById(fixture.userId());
            });
        }
    }

    private void runConcurrently(Fixture fixture, Runnable action) throws Exception {
        var pool = Executors.newFixedThreadPool(4);
        var ready = new CountDownLatch(4);
        var start = new CountDownLatch(1);
        var tasks = new ArrayList<Future<?>>();
        try {
            for (int i = 0; i < 4; i++) {
                tasks.add(pool.submit(() -> new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                    users.findById(fixture.userId()).orElseThrow();
                    ready.countDown();
                    try {
                        if (!start.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("동시 요청 시작 시간 초과");
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        throw new IllegalStateException(e);
                    }
                    action.run();
                })));
            }
            assertTrue(ready.await(10, TimeUnit.SECONDS));
            start.countDown();
            for (var task : tasks) task.get(20, TimeUnit.SECONDS);
        } finally {
            start.countDown();
            pool.shutdownNow();
            assertTrue(pool.awaitTermination(20, TimeUnit.SECONDS));
        }
    }

    private Video video(User owner) {
        var category = categories.saveAndFlush(new Category("action-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "action tag"));
        return videos.saveAndFlush(new Video(owner, category, tag, "action video", "", "missing.mp4", 30));
    }

    private User member() {
        String suffix = suffix();
        return users.saveAndFlush(new User("action-" + suffix + "@example.com", "test hash", "action-" + suffix));
    }

    private String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private MockHttpSession session(User user) {
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(user.getEmail(), null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))));
        var session = new MockHttpSession();
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return session;
    }

    private record Fixture(Long userId, String email, Long videoId, Integer tagId, Integer categoryId) {
    }
}
