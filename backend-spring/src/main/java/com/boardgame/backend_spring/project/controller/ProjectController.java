package com.boardgame.backend_spring.project.controller;

import com.boardgame.backend_spring.project.dto.*;
import com.boardgame.backend_spring.project.service.ProjectService;
import com.boardgame.backend_spring.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

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
        return ResponseEntity.ok("개발자 배정 완료");
    }
}
