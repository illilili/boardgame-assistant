// `BoardgameConceptRepository.java`
package com.boardgame.backend_spring.concept.repository;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardgameConceptRepository extends JpaRepository<BoardgameConcept, Long> {
    Optional<BoardgameConcept> findByPlanId(Long planId);

    List<BoardgameConcept> findByProjectId(Long projectId);
}