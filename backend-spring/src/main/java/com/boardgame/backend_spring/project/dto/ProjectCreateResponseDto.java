package com.boardgame.backend_spring.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectCreateResponseDto {
    private Long projectId;
    private String projectName;
    private String creatorName;
    private String message;
}
