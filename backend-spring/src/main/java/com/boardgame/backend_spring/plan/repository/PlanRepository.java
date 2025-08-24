package com.boardgame.backend_spring.plan.repository;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    /**
     * 특정 컨셉(BoardgameConcept)에 연결된 기획서(Plan)를 찾습니다.
     * @param boardgameConcept 조회할 컨셉
     * @return Optional<Plan>
     */
    Optional<Plan> findByBoardgameConcept(BoardgameConcept boardgameConcept);
    List<Plan> findByStatus(PlanStatus status);
    //Optional<Plan> findByProjectIdAndStatus(Long projectId, PlanStatus status);
    @Query("SELECT p FROM Plan p WHERE p.project.id = :projectId AND p.status = :status")
    Optional<Plan> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") PlanStatus status);

    void deleteAllByProject(Project project);
    List<Plan> findAllByProject(Project project);

    /**
     * 특정 컨셉 ID로 기획서를 찾습니다.
     */
    @Query("SELECT p FROM Plan p WHERE p.boardgameConcept.conceptId = :conceptId")
    Optional<Plan> findByConceptId(@Param("conceptId") Long conceptId);
}