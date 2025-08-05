package com.boardgame.backend_spring.plan.dto;

import com.boardgame.backend_spring.plan.entity.PlanStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlanSubmitResponse {
    private Long planId;
    private String planDocUrl;
    private PlanStatus status;
}
