package com.boardgame.backend_spring.project.controller;

import com.boardgame.backend_spring.project.dto.ProjectCreateRequestDto;
import com.boardgame.backend_spring.project.dto.ProjectCreateResponseDto;
import com.boardgame.backend_spring.project.dto.ProjectStatusResponseDto;
import com.boardgame.backend_spring.project.dto.ProjectRenameRequestDto;
import com.boardgame.backend_spring.project.dto.ProjectRenameResponseDto;
import com.boardgame.backend_spring.project.dto.AssignDeveloperRequestDto;
import com.boardgame.backend_spring.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.boardgame.backend_spring.user.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectCreateResponseDto> createProject(
            @RequestBody ProjectCreateRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(projectService.createProject(dto, user));
    }

    @GetMapping("/{projectId}/status")
    public ResponseEntity<ProjectStatusResponseDto> getStatus(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectStatus(projectId));
    }

    @PutMapping("/{projectId}/rename")
    public ResponseEntity<ProjectRenameResponseDto> renameProject(
            @PathVariable Long projectId,
            @RequestBody ProjectRenameRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(projectService.renameProject(projectId, dto.getNewTitle(), user));
    }

    @PutMapping("/{projectId}/assign-developer")
    public ResponseEntity<String> assignDeveloper(
            @PathVariable Long projectId,
            @RequestBody AssignDeveloperRequestDto dto,
            @AuthenticationPrincipal User user) {
        projectService.assignDeveloperToProject(projectId, dto, user);
        return ResponseEntity.ok("개발자 배정 완료");
    }
}
