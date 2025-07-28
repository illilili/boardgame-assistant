package com.boardgame.backend_spring.user.repository;

import com.boardgame.backend_spring.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);         // 이메일 중복 확인용
    Optional<User> findByEmail(String email);    // 로그인용
}
