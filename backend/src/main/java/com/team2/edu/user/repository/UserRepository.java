package com.team2.edu.user.repository;

import com.team2.edu.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);
    boolean existsByEmailAndDeletedAtIsNull(String email);

    Optional<User> findByEmail(String email);
}
