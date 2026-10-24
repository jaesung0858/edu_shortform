package com.team2.edu;

import java.time.LocalDateTime;

// 관리자 회원 조회 응답
public record AdminUserResponse(
        Long userId,
        String email,
        String nickname,
        String role,
        LocalDateTime createdAt
) {
}
