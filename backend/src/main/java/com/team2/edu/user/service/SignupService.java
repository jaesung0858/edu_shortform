package com.team2.edu.user.service;

import com.team2.edu.user.dto.SignupRequest;
import com.team2.edu.user.dto.SignupResponse;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
@Service
public class SignupService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public SignupService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 이메일·닉네임 중복 확인 후 회원 등록
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = request.email().trim();
        String nickname = request.nickname().trim();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }

        if (userRepository.existsByNickname(nickname)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(email, encodedPassword, nickname);

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 사용 중인 이메일 또는 닉네임입니다.");
        }

        return new SignupResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname()
        );
    }
}
