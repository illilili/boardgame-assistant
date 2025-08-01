package com.boardgame.backend_spring.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TaskComponentDto {
    private Long componentId;
    private String type;
    private String title;
    private String effect;
    private String description;
    private List<SubTaskDto> subTasks;
}
