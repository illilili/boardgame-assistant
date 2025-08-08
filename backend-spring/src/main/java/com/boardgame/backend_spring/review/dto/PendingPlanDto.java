package com.boardgame.backend_spring.review.dto;

import com.boardgame.backend_spring.plan.entity.PlanStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PendingPlanDto {
    private Long planId;
    private String projectTitle;
    private String conceptTheme;
    private String planDocUrl;
    private PlanStatus status;
}
