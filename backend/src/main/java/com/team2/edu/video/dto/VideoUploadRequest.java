package com.team2.edu.video.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

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
        Integer durationSec
) {
}
