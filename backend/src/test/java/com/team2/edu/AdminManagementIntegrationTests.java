package com.team2.edu;

import com.team2.edu.user.entity.Role;
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
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminManagementIntegrationTests {

    private static final String PASSWORD = "AdminTest123!";

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired VideoRepository videos;
    @Autowired PasswordEncoder encoder;
    @Autowired EntityManager entityManager;

    @Test
    void managementRoutesRequireAdminRole() throws Exception {
        var session = login(member(Role.USER));
        for (var request : List.of(get("/api/admin/users"), get("/api/admin/users/1"),
                patch("/api/admin/users/1"), delete("/api/admin/users/1"),
                get("/api/admin/videos"), get("/api/admin/videos/1"),
                patch("/api/admin/videos/1"), delete("/api/admin/videos/1"))) {
            mvc.perform(request).andExpect(status().isUnauthorized());
            mvc.perform(request.session(session)).andExpect(status().isForbidden());
        }
    }

    @Test
    void adminCanFindMemberAndUpdateNickname() throws Exception {
        var admin = login(member(Role.ADMIN));
        var target = member(Role.USER);
        String path = "/api/admin/users/" + target.getId();
        String name = "updated-" + suffix();

        mvc.perform(get(path).session(admin)).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(target.getEmail()))
                .andExpect(jsonPath("$.password").doesNotExist());
        mvc.perform(patch(path).session(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"  " + name + "  \"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nickname").value(name))
                .andExpect(jsonPath("$.email").value(target.getEmail()));
        mvc.perform(get("/api/admin/users").param("keyword", name).session(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].userId").value(target.getId().intValue()));
        entityManager.clear();
        mvc.perform(get("/api/users/me").session(login(target)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nickname").value(name));
    }

    @Test
    void rejectsInvalidOrDuplicateNicknameAndProtectsAdminAccounts() throws Exception {
        var admin = member(Role.ADMIN);
        var session = login(admin);
        var target = member(Role.USER);
        String path = "/api/admin/users/" + target.getId();
        mvc.perform(patch(path).session(session).contentType(MediaType.APPLICATION_JSON).content("{\"nickname\":\"  \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(patch(path).session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"" + admin.getNickname() + "\"}"))
                .andExpect(status().isConflict());
        mvc.perform(get(path).session(session)).andExpect(jsonPath("$.nickname").value(target.getNickname()));
        mvc.perform(delete("/api/admin/users/" + admin.getId()).session(session)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/users/0").session(session)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/admin/users/999999999").session(session)).andExpect(status().isNotFound());
    }

    @Test
    void softDeleteBlocksOldSessionsAndNewLoginAndKeepsMemberVideos() throws Exception {
        var admin = login(member(Role.ADMIN));
        var target = member(Role.USER);
        var targetSession = login(target);
        var video = video(target);
        String path = "/api/admin/users/" + target.getId();

        mvc.perform(delete(path).session(admin)).andExpect(status().isNoContent());
        entityManager.clear();
        mvc.perform(get(path).session(admin)).andExpect(status().isNotFound());
        mvc.perform(delete(path).session(admin)).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/users").param("keyword", target.getEmail()).session(admin))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/api/video-categories").session(targetSession)).andExpect(status().isUnauthorized());
        assertThat(targetSession.isInvalid()).isTrue();
        mvc.perform(post("/api/login").accept(MediaType.APPLICATION_JSON)
                        .param("username", target.getEmail()).param("password", PASSWORD))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/videos/" + video.getId())).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/videos/" + video.getId()).session(admin)).andExpect(status().isOk());
        assertThat(users.findById(target.getId()).orElseThrow().isDeleted()).isTrue();
        assertThat(videos.findById(video.getId())).isPresent();
    }

    @Test
    void adminCanFindEditAndDeleteAnotherMembersVideo() throws Exception {
        var admin = login(member(Role.ADMIN));
        var video = video(member(Role.USER));
        String path = "/api/admin/videos/" + video.getId();
        String newTitle = "hidden-" + suffix();
        mvc.perform(patch(path).session(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"" + newTitle + "\",\"description\":\"edited\",\"status\":\"HIDDEN\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.title").value(newTitle))
                .andExpect(jsonPath("$.status").value("HIDDEN"));
        mvc.perform(get("/api/admin/videos").param("keyword", newTitle).session(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.videos[0].videoId").value(video.getId().intValue()));
        mvc.perform(get(path).session(admin)).andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("edited"));
        mvc.perform(get("/api/videos/" + video.getId()).session(admin)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/videos/" + video.getId()).session(admin)).andExpect(status().isForbidden());
        mvc.perform(delete(path).session(admin)).andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        mvc.perform(get(path).session(admin)).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/videos").param("keyword", newTitle).session(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.videos").isEmpty());
        var stored = videos.findById(video.getId()).orElseThrow();
        assertThat(stored.getStatus()).isEqualTo(VideoStatus.DELETED);
        assertThat(stored.getVideoKey()).isEqualTo("test.mp4");
    }

    @Test
    void rejectsInvalidVideoUpdatesAndUpdatesOnlySubmittedFields() throws Exception {
        var admin = login(member(Role.ADMIN));
        var video = video(member(Role.USER));
        String path = "/api/admin/videos/" + video.getId();
        for (String body : List.of("{}", "{\"title\":\"  \"}", "{\"status\":\"DELETED\"}", "{\"status\":0}")) {
            mvc.perform(patch(path).session(admin).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(patch(path).session(admin).contentType(MediaType.APPLICATION_JSON).content("{\"description\":\"\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.description").value(""))
                .andExpect(jsonPath("$.title").value(video.getTitle())).andExpect(jsonPath("$.status").value("PUBLIC"));
    }

    private MockHttpSession login(User user) throws Exception {
        var result = mvc.perform(post("/api/login").accept(MediaType.APPLICATION_JSON)
                        .param("username", user.getEmail()).param("password", PASSWORD))
                .andExpect(status().isNoContent()).andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private User member(Role role) {
        String nickname = "management-" + suffix();
        var user = new User(nickname + "@example.com", encoder.encode(PASSWORD), nickname);
        ReflectionTestUtils.setField(user, "role", role);
        return users.saveAndFlush(user);
    }

    private Video video(User creator) {
        var category = categories.saveAndFlush(new Category("management-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "test tag"));
        return videos.saveAndFlush(new Video(creator, category, tag, "video-" + suffix(), "test", "test.mp4", 30));
    }

    private String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
