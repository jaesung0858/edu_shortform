package com.team2.edu.user.dto;

// 회원가입 응답
public record SignupResponse(
        Long userId,
        String email,
        String nickname
) {
}
