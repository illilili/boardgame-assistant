package com.boardgame.backend_spring.project.repository;

import com.boardgame.backend_spring.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
}
