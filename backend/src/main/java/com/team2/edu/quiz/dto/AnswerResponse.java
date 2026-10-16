package com.team2.edu.quiz.dto;

/** 결과·해설 화면(U-04)에 보낼 채점 결과 */
public record AnswerResponse(
        boolean correct,
        int answerNo,
        String explanation,
        String tagName,
        boolean addedToWrongNote
) {
}
