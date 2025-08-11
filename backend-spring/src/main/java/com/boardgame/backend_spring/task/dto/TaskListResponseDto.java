package com.boardgame.backend_spring.task.dto;

import com.boardgame.backend_spring.task.dto.TaskComponentDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 프로젝트의 전체 개발 목록 응답 DTO
 */
@Data
@Builder
public class TaskListResponseDto {

    private Long projectId;
    private String projectTitle;  // optional
    private List<TaskComponentDto> components;
}
