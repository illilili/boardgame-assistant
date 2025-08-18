package com.boardgame.backend_spring.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ProjectRenameResponseDto {
    private Long projectId;
    private String updatedTitle;
    private String message;
}
