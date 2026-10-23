package com.team2.edu;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
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
        var browserSuccess = new SimpleUrlAuthenticationSuccessHandler("/api/users/me");
        var browserFailure = new SimpleUrlAuthenticationFailureHandler("/login?error");
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/videos", "/api/videos/*", "/api/videos/*/content").permitAll()
                .requestMatchers(HttpMethod.HEAD, "/api/videos/*/content").permitAll()
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
                .loginProcessingUrl("/api/login")
                .successHandler((request, response, authentication) -> {
                    if (wantsJson(request)) {
                        response.setStatus(HttpStatus.NO_CONTENT.value());
                    } else {
                        browserSuccess.onAuthenticationSuccess(request, response, authentication);
                    }
                })
                .failureHandler((request, response, exception) -> {
                    if (wantsJson(request)) {
                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    } else {
                        browserFailure.onAuthenticationFailure(request, response, exception);
                    }
                })
                .permitAll()
        ).logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler((request, response, authentication) ->
                        response.setStatus(HttpStatus.NO_CONTENT.value()))
        ).exceptionHandling(exceptions -> exceptions
                .defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        PathPatternRequestMatcher.withDefaults().matcher("/api/**"))
        ).csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        return http.build();
    }

    private boolean wantsJson(HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE);
    }
}
