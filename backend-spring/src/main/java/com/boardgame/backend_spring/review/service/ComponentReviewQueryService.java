package com.boardgame.backend_spring.review.service;

import com.boardgame.backend_spring.review.dto.ComponentReviewDetailDto;

public interface ComponentReviewQueryService {
    ComponentReviewDetailDto getComponentDetail(Long componentId);
}
