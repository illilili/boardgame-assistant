package com.boardgame.backend_spring.project.controller;

import com.boardgame.backend_spring.project.dto.ProjectCreateRequestDto;
import com.boardgame.backend_spring.project.dto.ProjectStatusResponseDto;
import com.boardgame.backend_spring.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Long> createProject(@RequestBody ProjectCreateRequestDto dto) {
        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @GetMapping("/{projectId}/status")
    public ResponseEntity<ProjectStatusResponseDto> getStatus(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectStatus(projectId));
    }
}
