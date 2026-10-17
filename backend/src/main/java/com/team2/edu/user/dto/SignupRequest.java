package com.team2.edu.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// 회원가입 입력값과 검증 조건을 정의한다.
public record SignupRequest(
        @NotBlank
        @Email
        @Size(max = 100)
        String email,

        @NotBlank
        @Size(
                min = 8,
                max = 24,
                message = "비밀번호는 8~24글자여야 합니다."
        )
        @Pattern(
                regexp = "[!-~]+",
                message = "비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다."
        )
        String password,

        @NotBlank
        @Size(max = 30)
        String nickname
) {
}
