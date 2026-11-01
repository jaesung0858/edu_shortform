package com.team2.edu;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
class SecurityConfig {

    // 비밀번호 BCrypt 해시 처리
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 접근 권한과 세션 로그인 설정
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/videos", "/api/videos/*", "/api/videos/*/content", "/api/videos/*/thumbnail").permitAll()
                .requestMatchers(HttpMethod.HEAD, "/api/videos/*/content", "/api/videos/*/thumbnail").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(
                        "/health", "/error",
                        "/swagger-ui/**", "/v3/api-docs/**"
                ).permitAll()
                // 퀴즈 문항은 누구나 볼 수 있다. 채점·추천은 로그인 회원 기준이라 아래 authenticated()로 막힌다
                .requestMatchers(HttpMethod.GET, "/api/videos/*/quizzes").permitAll()
                .anyRequest().authenticated()
        ).formLogin(form -> form
                .loginProcessingUrl("/api/login")
                .successHandler((request, response, authentication) -> {
                    String accept = request.getHeader("Accept");
                    if (accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE)) {
                        response.setStatus(HttpStatus.NO_CONTENT.value());
                    } else {
                        response.sendRedirect("/api/users/me");
                    }
                })
                .failureHandler((request, response, exception) -> {
                    String accept = request.getHeader("Accept");
                    if (accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE)) {
                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    } else {
                        response.sendRedirect("/login?error");
                    }
                })
                .permitAll()
        ).logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler((request, response, authentication) ->
                        response.setStatus(HttpStatus.NO_CONTENT.value()))
        ).exceptionHandling(exceptions -> exceptions
                .defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        PathPatternRequestMatcher.withDefaults().matcher("/api/**")
                )
        ).csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        return http.build();
    }

}
