package com.boardgame.backend_spring.component.repository;

import com.boardgame.backend_spring.component.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComponentRepository extends JpaRepository<Component, Long> {
    List<Component> findByPlanId(Long planId);
}
