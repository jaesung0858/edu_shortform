package com.team2.edu.video;

import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import com.team2.edu.video.repository.VideoRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.UUID;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VideoQueryIntegrationTests {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired VideoRepository videos;
    @Autowired EntityManager entityManager;

    @Test
    void filtersPublicVideosAndPagesInStableNewestOrder() throws Exception {
        var category = categories.saveAndFlush(new Category("list-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "list tag"));
        var creator = member();
        var ids = new ArrayList<Integer>();
        for (int i = 0; i < 13; i++) {
            var video = new Video(creator, category, tag, "lesson " + i, "", "test.mp4", 30);
            videos.saveAndFlush(video);
            ids.add(video.getId().intValue());
        }
        var hidden = new Video(creator, category, tag, "hidden", "", "hidden.mp4", 30);
        ReflectionTestUtils.setField(hidden, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(hidden);
        var deleted = new Video(creator, category, tag, "deleted", "", "deleted.mp4", 30);
        ReflectionTestUtils.setField(deleted, "status", VideoStatus.DELETED);
        videos.saveAndFlush(deleted);
        var removedCreator = member();
        ReflectionTestUtils.setField(removedCreator, "deletedAt", LocalDateTime.now());
        users.saveAndFlush(removedCreator);
        videos.saveAndFlush(new Video(removedCreator, category, tag, "removed creator", "", "removed.mp4", 30));
        entityManager.createNativeQuery("UPDATE video SET created_at = :createdAt WHERE category_id = :categoryId")
                .setParameter("createdAt", LocalDateTime.of(2026, 1, 1, 0, 0))
                .setParameter("categoryId", category.getId()).executeUpdate();
        entityManager.clear();
        Collections.reverse(ids);

        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos.length()").value(12))
                .andExpect(jsonPath("$.videos[*].videoId").value(contains(ids.subList(0, 12).toArray())))
                .andExpect(jsonPath("$.hasNext").value(true));
        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()).param("page", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos[*].videoId").value(contains(ids.subList(12, 13).toArray())))
                .andExpect(jsonPath("$.hasNext").value(false));
        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()).param("page", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos").isEmpty())
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    void categoryOptionsExcludeCategoriesWithOnlyHiddenVideos() throws Exception {
        var category = categories.saveAndFlush(new Category("hidden-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "hidden tag"));
        var video = new Video(member(), category, tag, "hidden lesson", "", "test.mp4", 30);
        ReflectionTestUtils.setField(video, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(video);

        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos").isEmpty())
                .andExpect(jsonPath("$.categories[*].categoryId").value(not(hasItem(category.getId()))));
    }

    @Test
    void validatesListParametersAndStillRequiresLoginToUpload() throws Exception {
        mvc.perform(get("/api/videos").param("page", "-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/videos").param("categoryId", "0")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/videos").param("page", "invalid")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/videos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/videos").param("keyword", "a".repeat(101))).andExpect(status().isBadRequest());
    }

    @Test
    void searchesTitlesWithCategoryAndTreatsWildcardsAsText() throws Exception {
        var category = categories.saveAndFlush(new Category("search-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "search tag"));
        var creator = member();
        var match = videos.saveAndFlush(new Video(creator, category, tag, "SQL 100%_! 기초", "", "test.mp4", 30));
        videos.saveAndFlush(new Video(creator, category, tag, "SQL 100ABC 기초", "", "test.mp4", 30));
        videos.saveAndFlush(new Video(creator, category, tag, "다른 제목", "SQL", "test.mp4", 30));
        var hidden = videos.saveAndFlush(new Video(creator, category, tag, "SQL 100%_! 숨김", "", "test.mp4", 30));
        ReflectionTestUtils.setField(hidden, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(hidden);

        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()).param("keyword", "  %_!  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos[*].videoId").value(contains(match.getId().intValue())));
        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()).param("keyword", "sql"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.videos.length()").value(2));
        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()).param("keyword", " "))
                .andExpect(status().isOk()).andExpect(jsonPath("$.videos.length()").value(3));
        mvc.perform(get("/api/videos").param("categoryId", category.getId().toString()).param("keyword", "없는 검색어"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.videos").isEmpty());
    }

    @Test
    void myListUsesSessionMemberAndExcludesOtherMembersAndDeletedVideos() throws Exception {
        var alice = member();
        var bob = member();
        var category = categories.saveAndFlush(new Category("mine-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "mine tag"));
        var first = videos.saveAndFlush(new Video(alice, category, tag, "alice public", "", "test.mp4", 30));
        var hidden = new Video(alice, category, tag, "alice hidden", "", "test.mp4", 30);
        ReflectionTestUtils.setField(hidden, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(hidden);
        var removed = new Video(alice, category, tag, "alice deleted", "", "test.mp4", 30);
        ReflectionTestUtils.setField(removed, "status", VideoStatus.DELETED);
        videos.saveAndFlush(removed);
        var other = videos.saveAndFlush(new Video(bob, category, tag, "bob public", "", "test.mp4", 30));

        mvc.perform(get("/api/users/me/videos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me/videos").session(session(alice))
                        .param("userId", bob.getId().toString()).header("X-User-Id", bob.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos[*].videoId").value(containsInAnyOrder(first.getId().intValue(), hidden.getId().intValue())))
                .andExpect(jsonPath("$.videos[?(@.status == 'HIDDEN')].title").value(hasItem("alice hidden")));
        mvc.perform(get("/api/users/me/videos").session(session(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos[*].videoId").value(contains(other.getId().intValue())));
        mvc.perform(get("/api/users/me/videos").session(session(member())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.videos").isEmpty());
        ReflectionTestUtils.setField(alice, "deletedAt", LocalDateTime.now());
        users.saveAndFlush(alice);
        mvc.perform(get("/api/users/me/videos").session(session(alice))).andExpect(status().isUnauthorized());
    }

    @Test
    void hiddenVideosAreOnlyVisibleToTheirOwnerAndDeletedVideosStayUnavailable() throws Exception {
        var owner = member();
        var other = member();
        var category = categories.saveAndFlush(new Category("detail-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "detail tag"));
        var video = videos.saveAndFlush(new Video(owner, category, tag, "lesson", "", "missing.mp4", 30));
        String path = "/api/videos/" + video.getId();
        mvc.perform(get(path)).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("lesson"));
        mvc.perform(get(path + "/content")).andExpect(status().isNotFound());
        ReflectionTestUtils.setField(video, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(video);
        mvc.perform(get(path)).andExpect(status().isNotFound());
        mvc.perform(get(path).session(session(other))).andExpect(status().isNotFound());
        mvc.perform(get(path + "/content").session(session(other))).andExpect(status().isNotFound());
        mvc.perform(get(path).session(session(owner))).andExpect(status().isOk());
        ReflectionTestUtils.setField(video, "status", VideoStatus.DELETED);
        videos.saveAndFlush(video);
        mvc.perform(get(path).session(session(owner))).andExpect(status().isNotFound());
        mvc.perform(get(path + "/content").session(session(owner))).andExpect(status().isNotFound());
        mvc.perform(get("/api/videos/999999999")).andExpect(status().isNotFound());
        mvc.perform(get("/api/videos/-1")).andExpect(status().isBadRequest());
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
        return users.saveAndFlush(new User("list-" + suffix + "@example.com", "test hash", "list-" + suffix));
    }

    private String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
