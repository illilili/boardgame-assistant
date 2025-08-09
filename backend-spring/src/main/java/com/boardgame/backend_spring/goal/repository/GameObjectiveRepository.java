package com.boardgame.backend_spring.goal.repository;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameObjectiveRepository extends JpaRepository<GameObjective, Long> {
    Optional<GameObjective> findByBoardgameConcept(BoardgameConcept boardgameConcept);
}