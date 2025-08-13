package com.boardgame.backend_spring.plan.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PlanSaveResponse {
    private Long planId;
    private String message;
    private String planContent; // 추가된 필드
}