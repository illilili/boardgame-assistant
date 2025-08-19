package com.boardgame.backend_spring.project.dto;

import lombok.Getter;

@Getter
public class ProjectRenameRequestDto {
    private String newTitle;
    private String newDescription;
}
