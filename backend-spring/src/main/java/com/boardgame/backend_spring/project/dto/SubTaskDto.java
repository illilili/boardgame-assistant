package com.boardgame.backend_spring.project.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubTaskDto {
    private Long contentId;
    private String type;
    private String status;
}
