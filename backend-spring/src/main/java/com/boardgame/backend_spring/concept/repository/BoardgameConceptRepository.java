package com.boardgame.backend_spring.concept.repository;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository를 상속받아 기본적인 CRUD 기능을 자동 생성
public interface BoardgameConceptRepository extends JpaRepository<BoardgameConcept, Long> {
}