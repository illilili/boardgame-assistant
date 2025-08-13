package com.boardgame.backend_spring.project.dto;

import lombok.Getter;

@Getter
public class AssignDeveloperRequestDto {
    private Long userId; // 개발자로 배정할 사용자 ID
}