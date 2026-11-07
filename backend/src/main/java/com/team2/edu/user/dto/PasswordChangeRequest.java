package com.team2.edu.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest(
        @NotBlank
        @Schema(description = "현재 비밀번호", example = "EduTest123!")
        String currentPassword,

        // 회원가입과 같은 규칙
        @NotBlank
        @Size(min = 8, max = 24, message = "비밀번호는 8~24글자여야 합니다.")
        @Pattern(regexp = "[!-~]+", message = "비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다.")
        @Schema(description = "새 비밀번호(8~24자, 영문·숫자·특수문자)", example = "NewPass123!")
        String newPassword
) {
}
