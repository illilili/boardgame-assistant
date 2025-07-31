package com.boardgame.backend_spring.plan.repository;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanComponent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Plan을 기준으로 PlanComponent 목록 전체 조회
public interface PlanComponentRepository extends JpaRepository<PlanComponent, Long> {
    List<PlanComponent> findByPlan(Plan plan);
}
