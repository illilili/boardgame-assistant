package com.boardgame.backend_spring.content.repository;

import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.component.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentRepository extends JpaRepository<Content, Long> {
    List<Content> findByComponentIn(List<Component> components);
}
