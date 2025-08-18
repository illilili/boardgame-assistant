package com.boardgame.backend_spring.plan.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlanSaveRequest {
    private Long planId;
    private Long conceptId; // 추가된 필드
    private String planContent;
}