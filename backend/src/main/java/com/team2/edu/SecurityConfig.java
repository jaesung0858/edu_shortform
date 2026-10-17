package com.team2.edu;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SecurityConfig {

    // 비밀번호 해시 생성과 비교에 BCrypt를 사용한다.
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // API 접근 권한과 세션 로그인 방식을 설정한다.
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(
                        "/health", "/error",
                        "/swagger-ui/**", "/v3/api-docs/**"
                ).permitAll()
                .requestMatchers(
                        "/api/videos/*/quizzes",
                        "/api/quizzes/*/answer",
                        "/api/videos/*/recommendations"
                ).permitAll()
                .anyRequest().authenticated()
        ).formLogin(form -> form
                .defaultSuccessUrl("/api/users/me", true)
                .permitAll()
        ).csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        return http.build();
    }
}
