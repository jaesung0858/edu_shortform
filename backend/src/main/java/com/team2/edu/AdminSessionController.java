package com.team2.edu;

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class AdminSessionController {
    // 현재 로그인한 관리자 계정 이름을 반환한다.
    @GetMapping("/api/admin/me")
    Map<String, String> me(Authentication authentication) {
        return Map.of("username", authentication.getName());
    }
}
