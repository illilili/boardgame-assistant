package com.boardgame.backend_spring.review.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewComponentRequest {
    private Long componentId;
    private boolean approve;
    private String reason; // 반려 사유
}
