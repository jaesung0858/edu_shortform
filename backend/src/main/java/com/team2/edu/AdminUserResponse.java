package com.team2.edu;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long userId,
        String email,
        String nickname,
        String role,
        LocalDateTime createdAt
) {
}
