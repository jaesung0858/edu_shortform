package com.team2.edu.video.controller;

import com.team2.edu.video.dto.VideoUploadRequest;
import com.team2.edu.video.dto.VideoUploadResponse;
import com.team2.edu.video.service.VideoUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class VideoUploadController {

    private final VideoUploadService uploadService;

    public VideoUploadController(VideoUploadService uploadService) {
        this.uploadService = uploadService;
    }

    // 영상 파일과 등록 정보 업로드
    @Operation(summary = "영상 업로드", description = "로그인한 회원이 MP4 영상(최대 100MB)을 로컬에 저장하고 DB에 등록합니다.")
    @ApiResponse(responseCode = "201", description = "영상 등록 완료")
    @ApiResponse(responseCode = "400", description = "필수 항목 누락, 입력 제한 위반, 빈 파일 또는 카테고리와 태그 불일치", content = @Content)
    @ApiResponse(responseCode = "401", description = "로그인이 필요하거나 로그인한 회원이 삭제됨", content = @Content)
    @ApiResponse(responseCode = "404", description = "카테고리 또는 개념 태그가 없음", content = @Content)
    @ApiResponse(responseCode = "413", description = "파일 또는 요청 용량 제한 초과", content = @Content)
    @ApiResponse(responseCode = "415", description = "MP4 파일 형식 또는 JSON 부분의 Content-Type이 올바르지 않음", content = @Content)
    @ApiResponse(responseCode = "500", description = "파일 저장 또는 DB 등록 실패", content = @Content)
    @PostMapping(value = "/api/videos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public VideoUploadResponse upload(@RequestPart("file") MultipartFile file,
                                      @RequestBody(content = @Content(encoding = @Encoding(
                                              name = "request", contentType = MediaType.APPLICATION_JSON_VALUE)))
                                      @Valid @RequestPart("request") VideoUploadRequest request,
                                      Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return uploadService.upload(authentication.getName(), file, request);
    }
}
