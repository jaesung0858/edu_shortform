package com.team2.edu.user;

import com.team2.edu.user.entity.Role;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import com.team2.edu.video.repository.VideoRepository;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 회원 본인의 닉네임 수정·비밀번호 변경·탈퇴 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserAccountIntegrationTests {

    private static final String PASSWORD = "AccountTest123!";

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired VideoRepository videos;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void requiresLogin() throws Exception {
        mvc.perform(json(patch("/api/users/me"), "{\"nickname\":\"x\"}")).andExpect(status().isUnauthorized());
        mvc.perform(json(patch("/api/users/me/password"), "{\"currentPassword\":\"a\",\"newPassword\":\"NewPass123!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(json(delete("/api/users/me"), "{\"password\":\"a\"}")).andExpect(status().isUnauthorized());
    }

    @Test
    void updatesNicknameAndRejectsDuplicateOrInvalid() throws Exception {
        var member = member();
        var other = member();
        var session = login(member);
        String nickname = "new-" + suffix();

        mvc.perform(json(patch("/api/users/me").session(session), "{\"nickname\":\" " + nickname + " \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(member.getId().intValue()))
                .andExpect(jsonPath("$.email").value(member.getEmail()))
                .andExpect(jsonPath("$.nickname").value(nickname))
                .andExpect(jsonPath("$.role").value("USER"));
        mvc.perform(get("/api/users/me").session(session)).andExpect(jsonPath("$.nickname").value(nickname));
        // 지금 닉네임 그대로 보내도 성공
        mvc.perform(json(patch("/api/users/me").session(session), "{\"nickname\":\"" + nickname + "\"}"))
                .andExpect(status().isOk());

        mvc.perform(json(patch("/api/users/me").session(session), "{\"nickname\":\"" + other.getNickname() + "\"}"))
                .andExpect(status().isConflict());
        mvc.perform(json(patch("/api/users/me").session(session), "{\"nickname\":\"   \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(json(patch("/api/users/me").session(session), "{\"nickname\":\"" + "가".repeat(31) + "\"}"))
                .andExpect(status().isBadRequest());
        assertThat(users.findById(member.getId()).orElseThrow().getNickname()).isEqualTo(nickname);
    }

    @Test
    void changesPasswordOnlyWithCurrentPassword() throws Exception {
        var member = member();
        var session = login(member);
        String path = "/api/users/me/password";

        mvc.perform(json(patch(path).session(session), "{\"currentPassword\":\"Wrong123!\",\"newPassword\":\"NewPass123!\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(json(patch(path).session(session), "{\"currentPassword\":\"" + PASSWORD + "\",\"newPassword\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(json(patch(path).session(session), "{\"currentPassword\":\"" + PASSWORD + "\",\"newPassword\":\"short\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(json(patch(path).session(session), "{\"currentPassword\":\"" + PASSWORD + "\",\"newPassword\":\"한글비밀번호입니다\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(json(patch(path).session(session), "{\"currentPassword\":\"" + PASSWORD + "\",\"newPassword\":\"NewPass123!\"}"))
                .andExpect(status().isNoContent());
        // 로그인은 유지되고, 다음 로그인부터 새 비밀번호를 쓴다
        mvc.perform(get("/api/users/me").session(session)).andExpect(status().isOk());
        loginRequest(member.getEmail(), PASSWORD).andExpect(status().isUnauthorized());
        loginRequest(member.getEmail(), "NewPass123!").andExpect(status().isNoContent());
    }

    @Test
    void withdrawsWithPasswordLogsOutAndHidesUploadedVideos() throws Exception {
        var member = member();
        var video = video(member);
        var session = login(member);

        mvc.perform(json(delete("/api/users/me").session(session), "{\"password\":\"Wrong123!\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(json(delete("/api/users/me").session(session), "{}")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/users/me").session(session)).andExpect(status().isOk());

        mvc.perform(json(delete("/api/users/me").session(session), "{\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
        assertThat(users.findById(member.getId()).orElseThrow().isDeleted()).isTrue();

        loginRequest(member.getEmail(), PASSWORD).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/videos/" + video.getId())).andExpect(status().isNotFound());
    }

    @Test
    void adminCannotWithdraw() throws Exception {
        var admin = member();
        ReflectionTestUtils.setField(admin, "role", Role.ADMIN);
        users.saveAndFlush(admin);

        mvc.perform(json(delete("/api/users/me").session(login(admin)), "{\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isForbidden());
        assertThat(users.findById(admin.getId()).orElseThrow().isDeleted()).isFalse();
    }

    private MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
        return request.contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private MockHttpSession login(User user) throws Exception {
        var result = loginRequest(user.getEmail(), PASSWORD).andExpect(status().isNoContent()).andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private org.springframework.test.web.servlet.ResultActions loginRequest(String email, String password) throws Exception {
        return mvc.perform(post("/api/login").accept(MediaType.APPLICATION_JSON)
                .param("username", email).param("password", password));
    }

    private User member() {
        String suffix = suffix();
        return users.saveAndFlush(new User("account-" + suffix + "@example.com",
                passwordEncoder.encode(PASSWORD), "account-" + suffix));
    }

    private Video video(User creator) {
        var category = categories.saveAndFlush(new Category("account-" + suffix()));
        var tag = tags.saveAndFlush(new ConceptTag(category, "account tag"));
        return videos.saveAndFlush(new Video(creator, category, tag, "account video", "", "missing.mp4", 30));
    }

    private String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
