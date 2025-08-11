// 파일: component/repository/ComponentRepository.java
package com.boardgame.backend_spring.component.repository;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.enumtype.ComponentStatus;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComponentRepository extends JpaRepository<Component, Long> {

    List<Component> findByBoardgameConcept(BoardgameConcept boardgameConcept);

    void deleteAllByBoardgameConcept(BoardgameConcept boardgameConcept);

    boolean existsByBoardgameConceptAndTitle(BoardgameConcept concept, String title);

    List<Component> findByStatus(ComponentStatus status);

}