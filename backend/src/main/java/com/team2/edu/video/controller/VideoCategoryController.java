package com.team2.edu.video.controller;

import com.team2.edu.video.dto.VideoCategoryRequest;
import com.team2.edu.video.dto.VideoCategoryResponse;
import com.team2.edu.video.dto.VideoTagRequest;
import com.team2.edu.video.service.VideoUploadService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/video-categories")
public class VideoCategoryController {

    private final VideoUploadService uploadService;

    public VideoCategoryController(VideoUploadService uploadService) {
        this.uploadService = uploadService;
    }

    @Operation(summary = "영상 업로드 분류 조회")
    @GetMapping
    public List<VideoCategoryResponse> categories() {
        return uploadService.categories();
    }

    @Operation(summary = "카테고리 추가", description = "로그인한 회원이 이름을 지정해 카테고리를 추가합니다. 같은 이름은 409를 반환합니다.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VideoCategoryResponse createCategory(@Valid @RequestBody VideoCategoryRequest request) {
        return uploadService.createCategory(request);
    }

    @Operation(summary = "개념 태그 추가", description = "선택한 카테고리에 태그를 추가합니다. 같은 카테고리 안의 이름 중복은 409를 반환합니다.")
    @PostMapping("/{categoryId}/tags")
    @ResponseStatus(HttpStatus.CREATED)
    public VideoCategoryResponse.Tag createTag(@PathVariable Integer categoryId,
                                               @Valid @RequestBody VideoTagRequest request) {
        return uploadService.createTag(categoryId, request);
    }
}
