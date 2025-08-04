package com.boardgame.backend_spring.plan.repository;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.plan.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    /**
     * 특정 컨셉(BoardgameConcept)에 연결된 기획서(Plan)를 찾습니다.
     * @param boardgameConcept 조회할 컨셉
     * @return Optional<Plan>
     */
    Optional<Plan> findByBoardgameConcept(BoardgameConcept boardgameConcept);
}
