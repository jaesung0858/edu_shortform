package com.team2.edu.learning;

import com.team2.edu.quiz.entity.Quiz;
import com.team2.edu.quiz.repository.QuizAttemptRepository;
import com.team2.edu.quiz.repository.QuizRepository;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import com.team2.edu.video.repository.VideoRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 퀴즈 출제·채점·추천 API가 로그인 세션 기준으로 동작하는지 확인 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LearningApiIntegrationTests {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired VideoRepository videos;
    @Autowired QuizRepository quizzes;
    @Autowired QuizAttemptRepository attempts;

    @Test
    void answerUsesLoggedInMemberAndIgnoresUserIdHeader() throws Exception {
        var learner = member();
        var other = member();
        var quiz = quizzes.saveAndFlush(quiz(video(member())));
        String path = "/api/quizzes/" + quiz.getId() + "/answer";

        // 로그인하지 않으면 헤더로 다른 회원 번호를 보내도 막힌다
        mvc.perform(post(path).header("X-User-Id", other.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"selectedNo\":1}"))
                .andExpect(status().isUnauthorized());

        mvc.perform(post(path).session(session(learner)).header("X-User-Id", other.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"selectedNo\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.addedToWrongNote").value(true));

        assertThat(attempts.findAll()).filteredOn(a -> a.getQuiz().getId().equals(quiz.getId()))
                .singleElement()
                .satisfies(a -> assertThat(a.getUser().getId()).isEqualTo(learner.getId()));
    }

    @Test
    void deletedMemberSessionIsRejected() throws Exception {
        var learner = member();
        var quiz = quizzes.saveAndFlush(quiz(video(member())));
        ReflectionTestUtils.setField(learner, "deletedAt", LocalDateTime.now());
        users.saveAndFlush(learner);

        mvc.perform(post("/api/quizzes/" + quiz.getId() + "/answer").session(session(learner))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"selectedNo\":1}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/videos/" + quiz.getVideo().getId() + "/recommendations").session(session(learner)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void quizzesArePublicButRecommendationsNeedLogin() throws Exception {
        var video = video(member());
        quizzes.saveAndFlush(quiz(video));

        mvc.perform(get("/api/videos/" + video.getId() + "/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].options.length()").value(4))
                .andExpect(jsonPath("$[0].answerNo").doesNotExist());
        mvc.perform(get("/api/videos/" + video.getId() + "/recommendations"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void hiddenVideoIsNotFoundForLearningApis() throws Exception {
        var learner = member();
        var video = video(member());
        var quiz = quizzes.saveAndFlush(quiz(video));
        ReflectionTestUtils.setField(video, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(video);

        mvc.perform(get("/api/videos/" + video.getId() + "/quizzes"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/quizzes/" + quiz.getId() + "/answer").session(session(learner))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"selectedNo\":1}"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/videos/" + video.getId() + "/recommendations").session(session(learner)))
                .andExpect(status().isNotFound());
    }

    @Test
    void recommendationsGiveThumbnailUrlAndSkipHiddenVideos() throws Exception {
        var learner = member();
        var creator = member();
        var current = video(creator);
        var withThumbnail = video(creator, current.getCategory(), current.getTag());
        withThumbnail.attachThumbnail("thumbnails/test.jpg");
        videos.saveAndFlush(withThumbnail);
        var withoutThumbnail = video(creator, current.getCategory(), current.getTag());
        var hidden = video(creator, current.getCategory(), current.getTag());
        ReflectionTestUtils.setField(hidden, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(hidden);

        mvc.perform(get("/api/videos/" + current.getId() + "/recommendations")
                        .param("correct", "false").session(session(learner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].videoId", not(hasItem(hidden.getId().intValue()))))
                .andExpect(jsonPath("$[?(@.videoId == %d)].thumbnailUrl", withThumbnail.getId())
                        .value(contains("/api/videos/" + withThumbnail.getId() + "/thumbnail")))
                .andExpect(jsonPath("$[?(@.videoId == %d)].thumbnailUrl", withoutThumbnail.getId())
                        .value(contains(nullValue())))
                .andExpect(jsonPath("$[0].thumbnailKey").doesNotExist());
    }

    private Video video(User creator) {
        var category = categories.saveAndFlush(new Category("learn-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "learn tag"));
        return video(creator, category, tag);
    }

    private Video video(User creator, Category category, ConceptTag tag) {
        return videos.saveAndFlush(new Video(creator, category, tag, "lesson", "", "test.mp4", 30));
    }

    private Quiz quiz(Video video) {
        return new Quiz(video, "question", List.of("a", "b", "c", "d"), 1, "explanation");
    }

    private MockHttpSession session(User user) {
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(user.getEmail(), null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))));
        var session = new MockHttpSession();
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return session;
    }

    private User member() {
        String suffix = suffix();
        return users.saveAndFlush(new User("learn-" + suffix + "@example.com", "test hash", "learn-" + suffix));
    }

    private String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
