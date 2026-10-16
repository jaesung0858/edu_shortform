package com.team2.edu.quiz.controller;

import com.team2.edu.global.CurrentUserId;
import com.team2.edu.quiz.dto.AnswerRequest;
import com.team2.edu.quiz.dto.AnswerResponse;
import com.team2.edu.quiz.dto.QuizResponse;
import com.team2.edu.quiz.service.QuizService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class QuizController {

    private final QuizService quizService;

    QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    /** 영상 재생이 끝나면 호출: 그 영상의 퀴즈 */
    @GetMapping("/api/videos/{videoId}/quizzes")
    List<QuizResponse> getQuizzes(@PathVariable Long videoId) {
        return quizService.getQuizzes(videoId);
    }

    /** 보기를 고르면 호출: 채점 + 오답 기록 */
    @PostMapping("/api/quizzes/{quizId}/answer")
    AnswerResponse answer(@CurrentUserId Long userId, @PathVariable Long quizId,
                          @Valid @RequestBody AnswerRequest request) {
        return quizService.answer(userId, quizId, request.selectedNo());
    }
}
