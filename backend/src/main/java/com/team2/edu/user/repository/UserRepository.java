package com.team2.edu.user.repository;

import com.team2.edu.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    // 같은 이메일의 회원이 있는지 확인한다.
    boolean existsByEmail(String email);

    // 같은 닉네임의 회원이 있는지 확인한다.
    boolean existsByNickname(String nickname);

    // 이메일로 회원 정보를 조회한다.
    Optional<User> findByEmail(String email);
}
