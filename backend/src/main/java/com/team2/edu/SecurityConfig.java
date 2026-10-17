package com.team2.edu;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/health", "/error", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // TODO 임시: users 테이블 로그인 연동 전까지 학습 API는 X-User-Id 헤더로 테스트
                .requestMatchers("/api/videos/*/quizzes", "/api/quizzes/*/answer",
                        "/api/videos/*/recommendations").permitAll()
                .anyRequest().authenticated()
        ).formLogin(form -> form.defaultSuccessUrl("/api/admin/me"))
        // TODO 로그인 방식(세션/JWT)이 정해지면 다시 설정. 지금은 React·Swagger에서 POST가 막히지 않게 /api/**만 제외
        .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        return http.build();
    }
}
