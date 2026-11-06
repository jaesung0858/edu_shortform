package com.team2.edu.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record WithdrawRequest(
        @NotBlank
        @Schema(description = "본인 확인용 현재 비밀번호", example = "EduTest123!")
        String password
) {
}
