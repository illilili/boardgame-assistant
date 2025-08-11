package com.boardgame.backend_spring.project.controller;

import com.boardgame.backend_spring.project.dto.*;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.enumtype.ProjectStatus;
import com.boardgame.backend_spring.project.service.ProjectService;
import com.boardgame.backend_spring.task.service.TaskService;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;
    private final ProjectRepository projectRepository;


    // 프로젝트 생성 (로그인 사용자 연동)
    @PostMapping
    public ResponseEntity<ProjectCreateResponseDto> createProject(
            @RequestBody ProjectCreateRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(projectService.createProject(dto, user));
    }

    // 프로젝트 상태 조회
    @GetMapping("/{projectId}/status")
    public ResponseEntity<ProjectStatusResponseDto> getStatus(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectStatus(projectId));
    }

    // 프로젝트 이름 변경
    @PutMapping("/{projectId}/rename")
    public ResponseEntity<ProjectRenameResponseDto> renameProject(
            @PathVariable Long projectId,
            @RequestBody ProjectRenameRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(projectService.renameProject(projectId, dto.getNewTitle(), user));
    }

    // 개발자 배정
    @PutMapping("/{projectId}/assign-developer")
    public ResponseEntity<String> assignDeveloper(
            @PathVariable Long projectId,
            @RequestBody AssignDeveloperRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        projectService.assignDeveloperToProject(projectId, dto, user);

        // 기획안 승인 상태일 경우에만 고정 요소 자동 생성
        try {
            taskService.initializeDeveloperTaskList(projectId);
        } catch (EntityNotFoundException e) {
            // 승인된 기획안이 없을 경우 무시 또는 로깅 (필요 시)
            System.out.println("기획안 승인 전이므로 고정 요소 생략");
        }

        return ResponseEntity.ok("개발자 배정 완료");
    }

    @PutMapping("/{projectId}/complete")
    public ResponseEntity<ProjectStatusResponseDto> completeProject(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setStatus(ProjectStatus.COMPLETED);
        project.setCompletedAt(LocalDateTime.now());
        projectRepository.save(project);

        return ResponseEntity.ok(new ProjectStatusResponseDto(project.getStatus()));
    }
}
