package com.team2.edu.video.controller;

import com.team2.edu.video.dto.VideoListResponse;
import com.team2.edu.video.dto.VideoDetailResponse;
import com.team2.edu.video.service.VideoQueryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VideoQueryController {

    private final VideoQueryService queryService;

    public VideoQueryController(VideoQueryService queryService) {
        this.queryService = queryService;
    }

    @Operation(summary = "공개 영상 목록·검색", description = "제목에 keyword가 포함된 공개 영상을 최신순으로 12개씩 조회합니다. page는 0부터 시작합니다.")
    @GetMapping("/api/videos")
    public VideoListResponse videos(@RequestParam(defaultValue = "0") @Min(0) int page,
                                    @RequestParam(required = false) @Positive Integer categoryId,
                                    @RequestParam(defaultValue = "") @Size(max = 100) String keyword) {
        return queryService.findAll(page, categoryId, keyword);
    }

    @Operation(summary = "내 영상 목록", description = "로그인한 회원의 공개·숨김 영상을 최신 등록순으로 12개씩 조회합니다.")
    @GetMapping("/api/users/me/videos")
    public VideoListResponse myVideos(@RequestParam(defaultValue = "0") @Min(0) int page,
                                      Authentication authentication) {
        return queryService.findMine(authentication.getName(), page);
    }

    @Operation(summary = "영상 상세 조회")
    @GetMapping("/api/videos/{videoId}")
    public VideoDetailResponse detail(@PathVariable @Positive Long videoId, Authentication authentication) {
        return queryService.detail(videoId, authentication == null ? null : authentication.getName());
    }

    @Operation(summary = "영상 파일 재생", description = "MP4 파일을 반환하며 구간 요청을 지원합니다. 숨김 영상은 작성자만 재생할 수 있습니다.")
    @GetMapping("/api/videos/{videoId}/content")
    public ResponseEntity<Resource> content(@PathVariable @Positive Long videoId, Authentication authentication) {
        Resource resource = queryService.content(videoId, authentication == null ? null : authentication.getName());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType("video/mp4")).body(resource);
    }

    @Operation(summary = "영상 썸네일 조회")
    @GetMapping("/api/videos/{videoId}/thumbnail")
    public ResponseEntity<Resource> thumbnail(@PathVariable @Positive Long videoId, Authentication authentication) {
        Resource resource = queryService.thumbnail(videoId, authentication == null ? null : authentication.getName());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(MediaType.IMAGE_JPEG).body(resource);
    }
}
