package com.boardgame.backend_spring.component.repository;

import com.boardgame.backend_spring.component.entity.SubTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {}