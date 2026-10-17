package com.team2.edu;

import java.time.LocalDateTime;

// 관리자에게 전달할 회원 조회 결과를 담는다.
public record AdminUserResponse(
        Long userId,
        String email,
        String nickname,
        String role,
        LocalDateTime createdAt
) {
}
