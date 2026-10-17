package com.team2.edu.user.dto;

// 회원가입 성공 후 반환할 회원 정보를 담는다.
public record SignupResponse(
        Long userId,
        String email,
        String nickname
) {
}
