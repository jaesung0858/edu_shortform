package com.team2.edu.video;

import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import com.team2.edu.video.repository.VideoRepository;
import jakarta.persistence.EntityManager;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.transaction.AfterTransaction;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class VideoUploadIntegrationTests {

    private static final Path UPLOAD_DIRECTORY = Path.of(System.getProperty("java.io.tmpdir"),
            "edu-video-test-" + UUID.randomUUID());

    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ConceptTagRepository tags;
    @Autowired VideoRepository videos;
    @Autowired EntityManager entityManager;
    @Autowired WebApplicationContext webContext;

    private Path uploadedFile;
    private Long uploadedId;
    private final String email = "upload-" + UUID.randomUUID() + "@example.com";

    @DynamicPropertySource
    static void uploadLocation(DynamicPropertyRegistry properties) {
        properties.add("storage.location", UPLOAD_DIRECTORY::toString);
    }

    @Test
    void storesMultipartRequestAndDatabaseRowTogether() throws Exception {
        User creator = users.saveAndFlush(new User(email, "test-only-hash", "upload-" + UUID.randomUUID().toString().substring(0, 8)));
        Category category = BeanUtils.instantiateClass(Category.class);
        ReflectionTestUtils.setField(category, "name", "test-" + UUID.randomUUID().toString().substring(0, 8));
        categories.saveAndFlush(category);
        ConceptTag tag = BeanUtils.instantiateClass(ConceptTag.class);
        ReflectionTestUtils.setField(tag, "name", "test tag");
        ReflectionTestUtils.setField(tag, "category", category);
        tags.saveAndFlush(tag);
        MockMvcBuilders.webAppContextSetup(webContext).build()
                .perform(get("/api/video-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name").value(hasItem(category.getName())))
                .andExpect(jsonPath("$[*].tags[*].tagId").value(hasItem(tag.getId())));
        byte[] bytes = {0, 0, 0, 12, 'f', 't', 'y', 'p', 'i', 's', 'o', 'm'};
        var file = new MockMultipartFile("file", "lesson.mp4", "video/mp4", bytes);

        String json = """
                {"title":"업로드 테스트","description":"테스트용","categoryId":%d,"tagId":%d,"durationSec":60}
                """.formatted(category.getId(), tag.getId());
        var metadata = new MockMultipartFile("request", "", "application/json", json.getBytes(StandardCharsets.UTF_8));
        var result = MockMvcBuilders.webAppContextSetup(webContext).build()
                .perform(multipart("/api/videos").file(file).file(metadata)
                        .principal(UsernamePasswordAuthenticationToken.authenticated(email, null, List.of())))
                .andExpect(status().isCreated()).andReturn();
        String response = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        uploadedId = ((Number) JsonPath.read(response, "$.videoId")).longValue();
        uploadedFile = UPLOAD_DIRECTORY.resolve((String) JsonPath.read(response, "$.videoKey"));
        assertArrayEquals(bytes, Files.readAllBytes(uploadedFile));
        entityManager.clear();
        var saved = videos.findById(uploadedId).orElseThrow();
        assertEquals(creator.getId(), saved.getCreator().getId());
        assertEquals("업로드 테스트", saved.getTitle());
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
        MockMvcBuilders.webAppContextSetup(webContext).build()
                .perform(get("/api/videos").param("categoryId", category.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videos[0].videoId").value(uploadedId.intValue()))
                .andExpect(jsonPath("$.videos[0].title").value("업로드 테스트"))
                .andExpect(jsonPath("$.videos[0].creatorNickname").value(creator.getNickname()))
                .andExpect(jsonPath("$.hasNext").value(false));
        var mvc = MockMvcBuilders.webAppContextSetup(webContext).build();
        mvc.perform(get("/api/videos/" + uploadedId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videoUrl").value("/api/videos/" + uploadedId + "/content"));
        mvc.perform(get("/api/videos/" + uploadedId + "/content"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("video/mp4"))
                .andExpect(content().bytes(bytes));
        mvc.perform(get("/api/videos/" + uploadedId + "/content").header("Range", "bytes=0-3"))
                .andExpect(status().isPartialContent())
                .andExpect(header().string("Content-Range", "bytes 0-3/12"))
                .andExpect(content().bytes(java.util.Arrays.copyOf(bytes, 4)));
        mvc.perform(get("/api/videos/" + uploadedId + "/content").header("Range", "bytes=100-200"))
                .andExpect(status().isRequestedRangeNotSatisfiable());
        ReflectionTestUtils.setField(saved, "status", VideoStatus.HIDDEN);
        videos.saveAndFlush(saved);
        mvc.perform(get("/api/videos/" + uploadedId + "/content"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/videos/" + uploadedId + "/content")
                        .principal(UsernamePasswordAuthenticationToken.authenticated(email, null, List.of())))
                .andExpect(status().isOk()).andExpect(content().bytes(bytes));
    }

    @Test
    void exposesMultipartUploadFormInSwagger() throws Exception {
        MockMvcBuilders.webAppContextSetup(webContext).build()
                .perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/videos'].post.requestBody.content['multipart/form-data'].schema.properties.file.format").value("binary"))
                .andExpect(jsonPath("$.paths['/api/videos'].post.requestBody.content['multipart/form-data'].schema.properties.request['$ref']").value("#/components/schemas/VideoUploadRequest"))
                .andExpect(jsonPath("$.paths['/api/videos'].post.requestBody.content['multipart/form-data'].encoding.request.contentType").value("application/json"))
                .andExpect(jsonPath("$.paths['/api/videos'].post.responses['400'].content").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/videos'].post.parameters").doesNotExist());
    }

    @AfterTransaction
    void rolledBackTestLeavesNoVideoOrMember() {
        if (uploadedFile != null) {
            assertFalse(Files.exists(uploadedFile));
            assertFalse(videos.existsById(uploadedId));
        }
        assertTrue(users.findByEmail(email).isEmpty());
    }

    @AfterAll
    static void removeEmptyTestDirectory() throws IOException {
        Files.deleteIfExists(UPLOAD_DIRECTORY);
    }
}
