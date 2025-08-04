package com.boardgame.backend_spring.project.service;

import com.boardgame.backend_spring.project.dto.ProjectCreateRequestDto;
import com.boardgame.backend_spring.project.dto.ProjectStatusResponseDto;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.entity.ProjectMember;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.project.repository.ProjectMemberRepository;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public Long createProject(ProjectCreateRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .status("DRAFT")
                .price(null)
                .createdAt(LocalDateTime.now())
                .build();

        Project saved = projectRepository.save(project);

        projectMemberRepository.save(ProjectMember.builder()
                .project(saved)
                .user(user)
                .role(ProjectMember.Role.PLANNER)
                .build());

        return saved.getId();
    }

    public ProjectStatusResponseDto getProjectStatus(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return new ProjectStatusResponseDto(project.getStatus());
    }
}