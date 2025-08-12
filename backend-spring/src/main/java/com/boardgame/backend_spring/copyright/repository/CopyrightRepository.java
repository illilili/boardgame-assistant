package com.boardgame.backend_spring.copyright.repository;

import com.boardgame.backend_spring.copyright.entity.Copyright;
import com.boardgame.backend_spring.plan.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CopyrightRepository extends JpaRepository<Copyright, Long> {
    Optional<Copyright> findByPlan(Plan plan);
}
