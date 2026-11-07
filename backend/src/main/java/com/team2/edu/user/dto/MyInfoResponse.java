package com.team2.edu.user.dto;

import com.team2.edu.user.entity.User;

/** GET /api/users/me 와 같은 모양 */
public record MyInfoResponse(Long userId, String email, String nickname, String role) {

    public static MyInfoResponse from(User user) {
        return new MyInfoResponse(user.getId(), user.getEmail(), user.getNickname(), user.getRole().name());
    }
}
