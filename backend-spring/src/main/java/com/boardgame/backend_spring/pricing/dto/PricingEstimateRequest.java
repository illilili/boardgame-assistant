package com.boardgame.backend_spring.pricing.dto;

import lombok.Data;
import java.util.Map;

/**
 * FastAPI로 보낼 가격 책정 요청 DTO
 * - 기획서 본문과 구성품 분석 정보 포함
 */
@Data
public class PricingEstimateRequest {
    private Long planId;
    private String planText;
    
    // 구성품 분석 정보
    private ComponentAnalysis componentAnalysis;
    
    @Data
    public static class ComponentAnalysis {
        private Integer totalCards;
        private Integer totalTokens;
        private Integer totalDice;
        private Integer totalBoards;
        private Integer totalComponents;
        private Map<String, Integer> componentBreakdown;
    }
}
