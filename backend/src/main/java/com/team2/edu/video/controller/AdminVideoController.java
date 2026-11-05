package com.team2.edu.video.controller;

import com.team2.edu.video.dto.AdminVideoUpdateRequest;
import com.team2.edu.video.dto.VideoDetailResponse;
import com.team2.edu.video.dto.VideoListResponse;
import com.team2.edu.video.service.VideoInteractionService;
import com.team2.edu.video.service.VideoQueryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/videos")
public class AdminVideoController {

    private final VideoQueryService queryService;
    private final VideoInteractionService interactionService;

    public AdminVideoController(VideoQueryService queryService, VideoInteractionService interactionService) {
        this.queryService = queryService;
        this.interactionService = interactionService;
    }

    @Operation(summary = "관리자 영상 목록·검색")
    @GetMapping
    public VideoListResponse videos(@RequestParam(defaultValue = "0") @Min(0) int page,
                                    @RequestParam(defaultValue = "") @Size(max = 100) String keyword) {
        return queryService.findForAdmin(page, keyword);
    }

    @Operation(summary = "관리자 영상 상세 조회")
    @GetMapping("/{videoId}")
    public VideoDetailResponse detail(@PathVariable @Positive Long videoId) {
        return queryService.detailForAdmin(videoId);
    }

    @Operation(summary = "관리자 영상 정보 수정")
    @PatchMapping("/{videoId}")
    public VideoDetailResponse update(@PathVariable @Positive Long videoId,
                                      @Valid @RequestBody AdminVideoUpdateRequest request) {
        return interactionService.updateAsAdmin(videoId, request);
    }

    @Operation(summary = "관리자 영상 삭제", description = "작성자와 관계없이 삭제 상태로 변경합니다.")
    @DeleteMapping("/{videoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Positive Long videoId) {
        interactionService.deleteAsAdmin(videoId);
    }
}
