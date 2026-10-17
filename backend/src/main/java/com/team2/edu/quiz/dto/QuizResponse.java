package com.team2.edu.quiz.dto;

import com.team2.edu.quiz.entity.Quiz;
import java.util.List;

/** 퀴즈 화면(U-03)에 보낼 문항. 정답은 포함하지 않는다 */
public record QuizResponse(Long quizId, String question, List<String> options) {

    public static QuizResponse from(Quiz quiz) {
        return new QuizResponse(quiz.getId(), quiz.getQuestion(), quiz.getOptions());
    }
}
