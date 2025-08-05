package com.boardgame.backend_spring.review.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewPlanRequest {
    private Long planId;
    private boolean approve;
    private String reason;
}
