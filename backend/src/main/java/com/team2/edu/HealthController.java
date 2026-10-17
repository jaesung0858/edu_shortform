package com.team2.edu;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HealthController {
    // 서버 실행 상태를 확인한다.
    @GetMapping("/health")
    Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
