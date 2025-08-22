package com.boardgame.backend_spring.concept.repository;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.project.entity.Project;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardgameConceptRepository extends JpaRepository<BoardgameConcept, Long> {
//    Optional<BoardgameConcept> findByPlanId(Long planId);

    List<BoardgameConcept> findByProjectId(Long projectId);

    /**
     * ID로 BoardgameConcept를 조회하면서 PESSIMISTIC_WRITE 잠금을 설정합니다.
     * 이 메소드를 호출한 트랜잭션이 종료될 때까지 다른 트랜잭션은 해당 레코드에 접근할 수 없습니다.
     * @param id the conceptId
     * @return an Optional of BoardgameConcept
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM BoardgameConcept c WHERE c.conceptId = :id")
    Optional<BoardgameConcept> findByIdWithLock(@Param("id") Long id);

    void deleteAllByProject(Project project);
}