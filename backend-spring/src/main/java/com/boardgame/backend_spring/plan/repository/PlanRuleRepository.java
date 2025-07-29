package com.boardgame.backend_spring.plan.repository;

import com.boardgame.backend_spring.plan.entity.PlanRule;
import com.boardgame.backend_spring.plan.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Plan을 기준으로 PlanRule 엔티티 조회
public interface PlanRuleRepository extends JpaRepository<PlanRule, Long> {
    Optional<PlanRule> findByPlan(Plan plan);
}
