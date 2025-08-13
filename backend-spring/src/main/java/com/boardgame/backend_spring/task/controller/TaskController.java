package com.boardgame.backend_spring.task.controller;

import com.boardgame.backend_spring.task.dto.TaskListResponseDto;
import com.boardgame.backend_spring.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/{projectId}/tasks/init")
    public ResponseEntity<Void> initializeTasks(@PathVariable Long projectId) {
        taskService.initializeDeveloperTaskList(projectId);
        return ResponseEntity.ok().build();
    }

    // [개발자] 개발 목록 조회 API
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<TaskListResponseDto> getTaskList(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTaskListByProject(projectId));
    }
}
