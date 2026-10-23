package com.team2.edu;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SessionLoginIntegrationTests {

    @Autowired MockMvc mvc;

    @Test
    void signsUpLogsInReadsMemberAndLogsOutWithSameSession() throws Exception {
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/video-categories")).andExpect(status().isUnauthorized());
        String email = "session-" + UUID.randomUUID() + "@example.com";
        String nickname = "session-" + UUID.randomUUID().toString().substring(0, 8);
        String member = """
                {"email":"%s","nickname":"%s","password":"SessionTest123!"}
                """.formatted(email, nickname);
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(member))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(member))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/login").accept(MediaType.APPLICATION_JSON)
                        .param("username", email).param("password", "wrong"))
                .andExpect(status().isUnauthorized());
        var login = mvc.perform(post("/api/login").accept(MediaType.APPLICATION_JSON)
                        .param("username", email).param("password", "SessionTest123!"))
                .andExpect(status().isNoContent()).andReturn();
        var session = (MockHttpSession) login.getRequest().getSession(false);
        assertNotNull(session);
        mvc.perform(get("/api/users/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.nickname").value(nickname));
        mvc.perform(get("/api/video-categories").session(session)).andExpect(status().isOk());
        mvc.perform(post("/api/logout").session(session)).andExpect(status().isNoContent());
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void keepsDefaultBrowserLoginFormAndRedirectAfterLogin() throws Exception {
        String email = "browser-" + UUID.randomUUID() + "@example.com";
        String member = """
                {"email":"%s","nickname":"browser-%s","password":"SessionTest123!"}
                """.formatted(email, UUID.randomUUID().toString().substring(0, 8));
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(member))
                .andExpect(status().isCreated());
        mvc.perform(get("/login").accept(MediaType.TEXT_HTML))
                .andExpect(status().isOk()).andExpect(content().string(containsString("/api/login")));
        mvc.perform(post("/api/login").accept(MediaType.TEXT_HTML)
                        .param("username", email).param("password", "SessionTest123!"))
                .andExpect(status().isFound()).andExpect(redirectedUrl("/api/users/me"));
    }
}
