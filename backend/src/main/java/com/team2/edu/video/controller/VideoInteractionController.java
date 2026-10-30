package com.team2.edu.video.controller;

import com.team2.edu.video.dto.VideoLikeResponse;
import com.team2.edu.video.dto.VideoViewResponse;
import com.team2.edu.video.service.VideoInteractionService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VideoInteractionController {

    private final VideoInteractionService interactionService;

    public VideoInteractionController(VideoInteractionService interactionService) {
        this.interactionService = interactionService;
    }

    @Operation(summary = "영상 조회 수 증가", description = "공개 영상의 재생 시작 시 호출합니다. 요청당 1 증가하며 중복 시청을 구분하지 않습니다.")
    @PostMapping("/api/videos/{videoId}/views")
    public VideoViewResponse addView(@PathVariable @Positive Long videoId) {
        return interactionService.addView(videoId);
    }

    @Operation(summary = "내 좋아요 상태", description = "공개 영상의 좋아요 여부와 전체 좋아요 수를 조회합니다.")
    @GetMapping("/api/videos/{videoId}/like")
    public VideoLikeResponse likeStatus(@PathVariable @Positive Long videoId, Authentication authentication) {
        return interactionService.likeStatus(videoId, authentication.getName());
    }

    @Operation(summary = "영상 좋아요", description = "반복 호출해도 회원당 한 번만 반영합니다. 로그인한 회원 기준입니다.")
    @PutMapping("/api/videos/{videoId}/like")
    public VideoLikeResponse like(@PathVariable @Positive Long videoId, Authentication authentication) {
        return interactionService.like(videoId, authentication.getName());
    }

    @Operation(summary = "영상 좋아요 취소", description = "좋아요 기록이 있을 때만 삭제하고 좋아요 수를 줄입니다.")
    @DeleteMapping("/api/videos/{videoId}/like")
    public VideoLikeResponse unlike(@PathVariable @Positive Long videoId, Authentication authentication) {
        return interactionService.unlike(videoId, authentication.getName());
    }

    @Operation(summary = "영상 삭제", description = "작성자만 삭제할 수 있습니다. 삭제 상태로 바꾸며 파일과 연결된 학습 기록은 유지합니다.")
    @DeleteMapping("/api/videos/{videoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Positive Long videoId, Authentication authentication) {
        interactionService.delete(videoId, authentication.getName());
    }
}
