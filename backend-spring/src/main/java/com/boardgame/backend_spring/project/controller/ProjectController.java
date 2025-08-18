// `ProjectController.java`
package com.boardgame.backend_spring.project.controller;

import com.boardgame.backend_spring.log.entity.ActivityLog;
import com.boardgame.backend_spring.log.repository.ActivityLogRepository;
import com.boardgame.backend_spring.log.service.ActionLogger;
import com.boardgame.backend_spring.project.dto.*;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.entity.ProjectMember;
import com.boardgame.backend_spring.project.enumtype.ProjectStatus;
import com.boardgame.backend_spring.project.repository.ProjectMemberRepository;
import com.boardgame.backend_spring.project.service.ProjectService;
import com.boardgame.backend_spring.task.service.TaskService;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;
    private final ActionLogger actionLogger;
    private final ActivityLogRepository activityLogRepository;

    // 🚨 [신규] 로그인 사용자의 프로젝트 목록 조회
    @GetMapping("/my")
    public ResponseEntity<List<ProjectSummaryDto>> getMyProjects(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.getProjectsByCreator(user));
    }
    private final ProjectRepository projectRepository;


    // 프로젝트 생성 (로그인 사용자 연동)
    @PostMapping
    public ResponseEntity<ProjectCreateResponseDto> createProject(
            @RequestBody ProjectCreateRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        ProjectCreateResponseDto response = projectService.createProject(dto, user);

        // 로그 기록
        actionLogger.log("PROJECT_CREATE", "PROJECT", response.getProjectId());
        return ResponseEntity.ok(response);
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
        return ResponseEntity.ok(
                projectService.renameProject(projectId, dto.getNewTitle(), dto.getNewDescription(), user)
        );
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

    // 전체 프로젝트 목록 조회
    @GetMapping
    public ResponseEntity<List<ProjectSummaryDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }
    // 전체 프로젝트 단건 조회
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectSummaryDto> getProjectDetail(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectDetail(projectId));
    }

    // 프로젝트 최근 5개 활동
    @GetMapping("/{projectId}/logs/recent")
    public List<ActivityLog> getRecentLogs(@PathVariable Long projectId) {
        return activityLogRepository.findTop5ByProjectIdOrderByTimestampDesc(projectId);
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<ProjectMemberDto>> getProjectMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectMembers(projectId));
    }
}