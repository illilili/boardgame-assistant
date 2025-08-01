package com.boardgame.backend_spring.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TaskListResponseDto {
    private List<TaskComponentDto> component;
}
