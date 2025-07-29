package com.boardgame.backend_spring.plan.repository;

import com.boardgame.backend_spring.plan.entity.PlanConcept;
import com.boardgame.backend_spring.plan.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Plan을 기준으로 PlanConcept 엔티티 조회
public interface PlanConceptRepository extends JpaRepository<PlanConcept, Long> {
    Optional<PlanConcept> findByPlan(Plan plan);
}
