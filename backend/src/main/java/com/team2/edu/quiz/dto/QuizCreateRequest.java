package com.team2.edu.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 영상 업로드 때 함께 등록하는 4지선다 문항 */
public record QuizCreateRequest(
        @NotBlank @Size(max = 500)
        @Schema(description = "문제", example = "INNER JOIN 결과에 포함되는 행은?")
        String question,

        @NotNull @Size(min = 4, max = 4)
        @Schema(description = "보기 4개 (순서대로 1~4번)", example = "[\"양쪽 모두 일치하는 행\", \"왼쪽 테이블 전체\", \"오른쪽 테이블 전체\", \"모든 조합\"]")
        List<@NotBlank @Size(max = 200) String> options,

        @NotNull @Min(1) @Max(4)
        @Schema(description = "정답 보기 번호(1~4)", example = "1")
        Integer answerNo,

        @Size(max = 1000)
        @Schema(description = "해설", example = "INNER JOIN은 조인 조건이 양쪽에서 일치하는 행만 남긴다")
        String explanation
) {
}
