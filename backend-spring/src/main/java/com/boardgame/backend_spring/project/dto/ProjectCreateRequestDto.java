package com.boardgame.backend_spring.project.dto;

import lombok.Getter;

@Getter
public class ProjectCreateRequestDto {
    private String name;
    private String description;
    private Long userId; // 생성자
}
