package com.team2.edu.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NicknameUpdateRequest(
        @NotBlank @Size(max = 30)
        @Schema(description = "새 닉네임", example = "새닉네임")
        String nickname
) {
}
