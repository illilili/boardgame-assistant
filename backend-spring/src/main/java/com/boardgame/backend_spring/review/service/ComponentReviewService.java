package com.boardgame.backend_spring.review.service;

import com.boardgame.backend_spring.review.dto.PendingComponentDto;

import java.util.List;

public interface ComponentReviewService {
    List<PendingComponentDto> getPendingComponents(Long projectId);
    String reviewComponent(Long componentId, boolean approve, String reason);
}
