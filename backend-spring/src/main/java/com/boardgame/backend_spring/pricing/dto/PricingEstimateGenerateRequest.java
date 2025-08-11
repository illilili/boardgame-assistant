package com.boardgame.backend_spring.pricing.dto;

import lombok.Data;

/**
 * 가격 책정 요청 DTO (사용자 입력)
 * - planId만 받음
 */
@Data
public class PricingEstimateGenerateRequest {
    private Long planId;
}
