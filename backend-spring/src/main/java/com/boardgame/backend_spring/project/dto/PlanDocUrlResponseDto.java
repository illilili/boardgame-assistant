package com.boardgame.backend_spring.project.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlanDocUrlResponseDto {
    private Long planId;
    private String planDocUrl;
}
