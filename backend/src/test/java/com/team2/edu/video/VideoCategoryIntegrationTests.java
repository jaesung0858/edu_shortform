package com.team2.edu.video;

import com.jayway.jsonpath.JsonPath;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VideoCategoryIntegrationTests {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired PasswordEncoder passwords;

    @Test
    void createsCategoryAndTagAndReturnsBothInOptions() throws Exception {
        var session = login();
        String name = "category-" + UUID.randomUUID().toString().substring(0, 8);
        var result = mvc.perform(post("/api/video-categories").session(session)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" " + name + " \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(name))
                .andExpect(jsonPath("$.tags").isEmpty()).andReturn();
        int id = JsonPath.read(result.getResponse().getContentAsString(), "$.categoryId");
        mvc.perform(post("/api/video-categories/" + id + "/tags").session(session)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" new tag \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("new tag"))
                .andExpect(jsonPath("$.tagId").isNumber());
        mvc.perform(get("/api/video-categories").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name").value(hasItem(name)))
                .andExpect(jsonPath("$[*].tags[*].name").value(hasItem("new tag")));
    }

    @Test
    void rejectsDuplicateCategoryNameIgnoringCaseAndSurroundingSpaces() throws Exception {
        var session = login();
        String name = "duplicate-" + UUID.randomUUID().toString().substring(0, 8);
        categories.saveAndFlush(new Category(name));
        mvc.perform(post("/api/video-categories").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\" " + name.toUpperCase(java.util.Locale.ROOT) + " \"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void allowsSameTagInDifferentCategoriesButRejectsDuplicateInSameCategory() throws Exception {
        var session = login();
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Category first = categories.saveAndFlush(new Category("first-" + suffix));
        Category second = categories.saveAndFlush(new Category("second-" + suffix));
        tags.saveAndFlush(new ConceptTag(first, "same tag"));
        mvc.perform(post("/api/video-categories/" + second.getId() + "/tags").session(session)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"same tag\"}"))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/video-categories/" + first.getId() + "/tags").session(session)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" SAME TAG \"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void rejectsBlankAndTooLongNamesAndUnknownCategory() throws Exception {
        var session = login();
        mvc.perform(post("/api/video-categories").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/video-categories").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + "a".repeat(31) + "\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/video-categories/1/tags").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + "a".repeat(51) + "\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/video-categories/-1/tags").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"test\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void requiresLoginToAddCategoryOrTag() throws Exception {
        mvc.perform(post("/api/video-categories").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"test\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/video-categories/1/tags").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"test\"}"))
                .andExpect(status().isUnauthorized());
    }

    private MockHttpSession login() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "category-" + suffix + "@example.com";
        users.saveAndFlush(new User(email, passwords.encode("CategoryTest123!"), "category-" + suffix));
        return (MockHttpSession) mvc.perform(post("/api/login").accept(MediaType.APPLICATION_JSON)
                        .param("username", email).param("password", "CategoryTest123!"))
                .andExpect(status().isNoContent()).andReturn().getRequest().getSession(false);
    }
}
