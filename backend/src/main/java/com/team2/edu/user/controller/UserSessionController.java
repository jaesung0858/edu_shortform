package com.team2.edu.user.controller;

import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class UserSessionController {

    private final UserRepository userRepository;

    public UserSessionController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 현재 로그인한 회원 정보를 반환한다.
    @GetMapping("/api/users/me")
    public Map<String, Object> me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .filter(member -> !member.isDeleted())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));

        return Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "nickname", user.getNickname(),
                "role", user.getRole().name()
        );
    }
}
