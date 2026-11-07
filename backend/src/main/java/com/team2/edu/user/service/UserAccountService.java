package com.team2.edu.user.service;

import com.team2.edu.user.dto.MyInfoResponse;
import com.team2.edu.user.dto.NicknameUpdateRequest;
import com.team2.edu.user.dto.PasswordChangeRequest;
import com.team2.edu.user.dto.WithdrawRequest;
import com.team2.edu.user.entity.Role;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * 로그인한 회원 본인의 정보 수정·비밀번호 변경·탈퇴.
 * 비밀번호가 틀리면 401이 아니라 400을 준다. 프론트가 401을 로그인 만료로 보고 로그인 화면으로 보내기 때문.
 */
@Service
public class UserAccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAccountService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public MyInfoResponse updateNickname(String email, NicknameUpdateRequest request) {
        User user = activeUser(email);
        String nickname = request.nickname().strip();
        if (!nickname.equals(user.getNickname())) {
            // 탈퇴 회원의 닉네임도 UNIQUE라 다시 쓸 수 없다
            if (userRepository.existsByNickname(nickname)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
            }
            user.changeNickname(nickname);
            try {
                userRepository.saveAndFlush(user);
            } catch (DataIntegrityViolationException e) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
            }
        }
        return MyInfoResponse.from(user);
    }

    @Transactional
    public void changePassword(String email, PasswordChangeRequest request) {
        User user = activeUser(email);
        checkPassword(user, request.currentPassword());
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호와 다른 비밀번호를 입력해주세요.");
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
    }

    // 행은 남기고 deleted_at만 기록. 올린 영상은 조회 쿼리에서 빠지고 학습 기록은 유지된다
    @Transactional
    public void withdraw(String email, WithdrawRequest request) {
        User user = activeUser(email);
        if (user.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 계정은 탈퇴할 수 없습니다.");
        }
        checkPassword(user, request.password());
        user.delete();
    }

    private void checkPassword(User user, String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        }
    }

    private User activeUser(String email) {
        return userRepository.findByEmail(email).filter(user -> !user.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
    }
}
