package com.boardgame.backend_spring.component.repository;

import com.boardgame.backend_spring.component.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComponentRepository extends JpaRepository<Component, Long> {}