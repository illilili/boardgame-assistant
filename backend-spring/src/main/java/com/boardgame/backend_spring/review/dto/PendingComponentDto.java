package com.boardgame.backend_spring.review.dto;

import com.boardgame.backend_spring.component.enumtype.ComponentStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PendingComponentDto {
    private Long componentId;
    private String projectTitle;   // 가능하면 매핑, 없으면 null 허용
    private String componentTitle;
    private String componentType;
    private ComponentStatus status; // PENDING_REVIEW 고정
}
