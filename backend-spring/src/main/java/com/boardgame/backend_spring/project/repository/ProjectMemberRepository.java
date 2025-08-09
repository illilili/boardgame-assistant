package com.boardgame.backend_spring.project.repository;

import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.entity.ProjectMember;
import com.boardgame.backend_spring.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    boolean existsByProjectAndUser(Project project, User user);
}