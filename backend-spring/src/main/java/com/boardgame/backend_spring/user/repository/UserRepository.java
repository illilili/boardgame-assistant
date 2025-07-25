package com.boardgame.backend_spring.user.repository;

import com.boardgame.backend_spring.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
