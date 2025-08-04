package com.boardgame.backend_spring.plan.repository;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanVersionRepository extends JpaRepository<PlanVersion, Long> {
    /**
     * 특정 기획서(Plan)에 속한 모든 버전을 생성 시각의 내림차순으로 조회합니다.
     * @param plan 부모 기획서
     * @return List<PlanVersion>
     */
    List<PlanVersion> findByPlanOrderByCreatedAtDesc(Plan plan);
}
