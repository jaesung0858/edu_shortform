package com.team2.edu.video.controller;

import com.team2.edu.video.dto.VideoUploadRequest;
import com.team2.edu.video.dto.VideoUploadResponse;
import com.team2.edu.video.service.VideoUploadService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class VideoUploadControllerTests {

    private final VideoUploadService service = mock(VideoUploadService.class);
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new VideoUploadController(service)).build();
    }

    @Test
    void acceptsMultipartFormAndReturnsCreatedVideo() throws Exception {
        when(service.upload(eq("learner@example.com"), any(), any()))
                .thenReturn(new VideoUploadResponse(10L, "SQL JOIN", "saved.mp4"));
        mvc.perform(request("SQL JOIN", "60")
                        .principal(UsernamePasswordAuthenticationToken.authenticated("learner@example.com", null, List.of())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.videoId").value(10))
                .andExpect(jsonPath("$.videoKey").value("saved.mp4"));
        verify(service).upload(eq("learner@example.com"), any(),
                eq(new VideoUploadRequest("SQL JOIN", null, 1, 1, 60)));
    }

    @Test
    void rejectsBlankTitleAndNonPositiveDuration() throws Exception {
        mvc.perform(request(" ", "60")).andExpect(status().isBadRequest());
        mvc.perform(request("SQL JOIN", "0")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void rejectsMissingVideoFile() throws Exception {
        mvc.perform(multipart("/api/videos").file(metadata("SQL JOIN", "60")))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void rejectsRequestWithoutAuthentication() throws Exception {
        mvc.perform(request("SQL JOIN", "60"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    void rejectsMissingMetadataAndJsonWithoutContentType() throws Exception {
        var video = new MockMultipartFile("file", "lesson.mp4", "video/mp4", new byte[]{1});
        mvc.perform(multipart("/api/videos").file(video))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/videos").file(video)
                        .file(new MockMultipartFile("request", "", "application/octet-stream", "{}".getBytes())))
                .andExpect(status().isUnsupportedMediaType());
        verifyNoInteractions(service);
    }

    private MockMultipartHttpServletRequestBuilder request(String title, String duration) {
        return multipart("/api/videos")
                .file(new MockMultipartFile("file", "lesson.mp4", "video/mp4", new byte[]{1}))
                .file(metadata(title, duration));
    }

    private MockMultipartFile metadata(String title, String duration) {
        String json = """
                {"title":"%s","categoryId":1,"tagId":1,"durationSec":%s}
                """.formatted(title, duration);
        return new MockMultipartFile("request", "", "application/json", json.getBytes(StandardCharsets.UTF_8));
    }
}
