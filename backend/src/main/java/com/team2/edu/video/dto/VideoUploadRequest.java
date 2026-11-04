package com.team2.edu.video.dto;

import com.team2.edu.quiz.dto.QuizCreateRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record VideoUploadRequest(
        @NotBlank @Size(max = 100)
        @Schema(description = "영상 제목", example = "SQL JOIN 기초")
        String title,

        @Size(max = 1000)
        @Schema(description = "영상 설명", example = "INNER JOIN의 기본 개념")
        String description,

        @NotNull @Positive
        @Schema(description = "카테고리 번호", example = "1")
        Integer categoryId,

        @NotNull @Positive
        @Schema(description = "해당 카테고리에 속한 개념 태그 번호", example = "1")
        Integer tagId,

        @NotNull @Positive
        @Schema(description = "재생 길이(초)", example = "60")
        Integer durationSec,

        @Size(max = 2)
        @Schema(description = "함께 등록할 퀴즈(최대 2문항). 생략하면 퀴즈 없이 등록")
        List<@NotNull @Valid QuizCreateRequest> quizzes
) {

    public VideoUploadRequest {
        quizzes = quizzes == null ? List.of() : quizzes;
    }

    public VideoUploadRequest(String title, String description, Integer categoryId, Integer tagId,
                              Integer durationSec) {
        this(title, description, categoryId, tagId, durationSec, List.of());
    }
}
