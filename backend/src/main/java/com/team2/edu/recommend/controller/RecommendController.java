package com.team2.edu.recommend.controller;

import com.team2.edu.global.CurrentUserId;
import com.team2.edu.recommend.dto.RecommendResponse;
import com.team2.edu.recommend.service.RecommendService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class RecommendController {

    private final RecommendService recommendService;

    RecommendController(RecommendService recommendService) {
        this.recommendService = recommendService;
    }

    /**
     * 퀴즈 결과 화면 다음에 호출. correct를 빼면(퀴즈 건너뜀) 정답일 때와 같게 처리한다.
     */
    @GetMapping("/api/videos/{videoId}/recommendations")
    List<RecommendResponse> recommend(@CurrentUserId Long userId, @PathVariable Long videoId,
                                      @RequestParam(defaultValue = "true") boolean correct) {
        return recommendService.recommend(userId, videoId, correct);
    }
}
