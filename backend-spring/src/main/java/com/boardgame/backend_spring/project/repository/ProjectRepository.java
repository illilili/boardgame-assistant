package com.boardgame.backend_spring.project.repository;

import com.boardgame.backend_spring.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}