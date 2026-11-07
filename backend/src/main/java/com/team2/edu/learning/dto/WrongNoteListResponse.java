package com.team2.edu.learning.dto;

import java.time.LocalDateTime;
import java.util.List;

/** 마이페이지 오답 노트 목록. 본인이 이미 푼 문항이라 정답과 해설을 함께 준다 */
public record WrongNoteListResponse(List<Item> notes, boolean hasNext) {

    public record Item(Long quizId, String question, List<String> options, int answerNo, String explanation,
                       String tagName, Long videoId, String videoTitle, String thumbnailUrl,
                       long wrongCount, LocalDateTime lastWrongAt) {
    }
}
