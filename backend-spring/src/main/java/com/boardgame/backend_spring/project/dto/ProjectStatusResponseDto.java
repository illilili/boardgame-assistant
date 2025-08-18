package com.boardgame.backend_spring.project.dto;

import com.boardgame.backend_spring.project.enumtype.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectStatusResponseDto {
    private ProjectStatus status;
}