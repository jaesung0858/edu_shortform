package com.team2.edu.user;

import com.team2.edu.quiz.entity.Quiz;
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
import com.team2.edu.video.repository.WatchHistoryRepository;
import jakarta.persistence.EntityManager;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 마이페이지 시청 기록·오답 노트 목록이 로그인 회원 기준으로 나오는지 확인 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MyPageListIntegrationTests {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired VideoRepository videos;
    @Autowired WatchHistoryRepository watchHistories;
    @Autowired QuizRepository quizzes;
    @Autowired EntityManager entityManager;

    @Test
    void watchHistoryShowsOwnPublicVideosInLastWatchedOrder() throws Exception {
        var learner = member();
        var other = member();
        var older = video(member(), "older");
        var newer = video(older.getCreator(), "newer");
        var hidden = video(older.getCreator(), "hidden");
        var others = video(older.getCreator(), "other member");

        watchHistories.record(learner.getId(), older.getId());
        watchHistories.record(learner.getId(), newer.getId());
        watchHistories.record(learner.getId(), hidden.getId());
        watchHistories.record(other.getId(), others.getId());
        watchedAt(learner, older, LocalDateTime.of(2026, 1, 3, 0, 0));
        watchedAt(learner, newer, LocalDateTime.of(2026, 1, 2, 0, 0));
        ReflectionTestUtils.setField(hidden, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(hidden);
        entityManager.clear();

        mvc.perform(get("/api/users/me/watch-history")).andExpect(status().isUnauthorized());
        // 다시 본 영상(older)이 맨 앞, 숨김 영상과 다른 회원 기록은 빠진다
        mvc.perform(get("/api/users/me/watch-history").session(session(learner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos[*].videoId").value(contains(
                        older.getId().intValue(), newer.getId().intValue())))
                .andExpect(jsonPath("$.videos[0].title").value("older"))
                .andExpect(jsonPath("$.categories").isEmpty())
                .andExpect(jsonPath("$.hasNext").value(false));
        mvc.perform(get("/api/users/me/watch-history").session(session(learner)).param("page", "-1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void wrongNotesShowOwnWrongQuizzesWithCountInLastWrongOrder() throws Exception {
        var learner = member();
        var other = member();
        var video = video(member(), "join lesson");
        var twice = quizzes.saveAndFlush(quiz(video, "twice"));
        var once = quizzes.saveAndFlush(quiz(video, "once"));
        var correctOnly = quizzes.saveAndFlush(quiz(video, "correct only"));
        var hiddenVideo = video(video.getCreator(), "hidden lesson");
        var onHidden = quizzes.saveAndFlush(quiz(hiddenVideo, "on hidden"));

        answer(learner, twice, 2);
        answer(learner, once, 3);
        answer(learner, twice, 4);
        answer(learner, correctOnly, 1);
        answer(learner, onHidden, 2);
        answer(other, once, 2);
        lastWrongAt(learner, once, LocalDateTime.of(2026, 1, 1, 0, 0));
        lastWrongAt(learner, twice, LocalDateTime.of(2026, 1, 2, 0, 0));
        hiddenVideo = videos.findById(hiddenVideo.getId()).orElseThrow();
        ReflectionTestUtils.setField(hiddenVideo, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(hiddenVideo);
        entityManager.clear();

        mvc.perform(get("/api/users/me/wrong-notes")).andExpect(status().isUnauthorized());
        // 맞힌 문항, 숨김 영상 문항, 다른 회원 오답은 빠지고 마지막으로 틀린 순으로 나온다
        mvc.perform(get("/api/users/me/wrong-notes").session(session(learner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes[*].quizId").value(contains(
                        twice.getId().intValue(), once.getId().intValue())))
                .andExpect(jsonPath("$.notes[0].wrongCount").value(2))
                .andExpect(jsonPath("$.notes[1].wrongCount").value(1))
                .andExpect(jsonPath("$.notes[0].question").value("twice"))
                .andExpect(jsonPath("$.notes[0].options.length()").value(4))
                .andExpect(jsonPath("$.notes[0].answerNo").value(1))
                .andExpect(jsonPath("$.notes[0].tagName").value("mypage tag"))
                .andExpect(jsonPath("$.notes[0].videoId").value(video.getId()))
                .andExpect(jsonPath("$.notes[0].videoTitle").value("join lesson"))
                .andExpect(jsonPath("$.notes[0].thumbnailUrl").value(nullValue()))
                .andExpect(jsonPath("$.notes[0].lastWrongAt").value("2026-01-02T00:00:00"))
                .andExpect(jsonPath("$.hasNext").value(false));
        mvc.perform(get("/api/users/me/wrong-notes").session(session(learner)).param("page", "-1"))
                .andExpect(status().isBadRequest());
    }

    private void answer(User user, Quiz quiz, int selectedNo) throws Exception {
        mvc.perform(post("/api/quizzes/" + quiz.getId() + "/answer").session(session(user))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"selectedNo\":" + selectedNo + "}"))
                .andExpect(status().isOk());
    }

    private void lastWrongAt(User user, Quiz quiz, LocalDateTime at) {
        entityManager.createNativeQuery("UPDATE wrong_note SET updated_at = :at WHERE user_id = :userId AND quiz_id = :quizId")
                .setParameter("at", at).setParameter("userId", user.getId())
                .setParameter("quizId", quiz.getId()).executeUpdate();
    }

    private Quiz quiz(Video video, String question) {
        return new Quiz(video, question, List.of("a", "b", "c", "d"), 1, "explanation");
    }

    private void watchedAt(User user, Video video, LocalDateTime at) {
        entityManager.createNativeQuery("UPDATE watch_history SET watched_at = :at WHERE user_id = :userId AND video_id = :videoId")
                .setParameter("at", at).setParameter("userId", user.getId())
                .setParameter("videoId", video.getId()).executeUpdate();
    }

    private Video video(User creator, String title) {
        var category = categories.saveAndFlush(new Category("mypage-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "mypage tag"));
        return videos.saveAndFlush(new Video(creator, category, tag, title, "", "test.mp4", 30));
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
        return users.saveAndFlush(new User("mypage-" + suffix + "@example.com", "test hash", "mypage-" + suffix));
    }

    private String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
