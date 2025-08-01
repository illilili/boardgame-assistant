package com.boardgame.backend_spring.goal.repository;

import com.boardgame.backend_spring.goal.entity.GameObjective;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameObjectiveRepository extends JpaRepository<GameObjective, Long> {
}