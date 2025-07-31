package com.boardgame.backend_spring.plan.repository;

import com.boardgame.backend_spring.plan.entity.PlanGoal;
import com.boardgame.backend_spring.plan.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Plan을 기준으로 PlanGoal 엔티티 조회
public interface PlanGoalRepository extends JpaRepository<PlanGoal, Long> {
    Optional<PlanGoal> findByPlan(Plan plan);
}
