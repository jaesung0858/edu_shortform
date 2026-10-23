package com.team2.edu.user.service;

import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public LoginUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 삭제된 회원을 제외하고 로그인 정보 조회
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmail(email)
                .filter(member -> !member.isDeleted())
                .orElseThrow(() ->
                        new UsernameNotFoundException("회원을 찾을 수 없습니다."));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}
