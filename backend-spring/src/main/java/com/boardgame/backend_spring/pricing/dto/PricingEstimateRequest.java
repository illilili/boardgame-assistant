package com.boardgame.backend_spring.pricing.dto;

import lombok.Data;

/**
 * FastAPI로 보낼 가격 책정 요청 DTO
 * - 기획서 본문까지 포함
 */
@Data
public class PricingEstimateRequest {
    private Long planId;
    private String planText;
}
