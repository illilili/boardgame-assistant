package com.boardgame.backend_spring.pricing.dto;

import lombok.Data;
import java.util.Map;

/**
 * 가격 책정 요청 DTO (사용자 입력)
 * - planId와 구성품 분석 정보를 받음
 */
@Data
public class PricingEstimateGenerateRequest {
    private Long planId;
    private Long projectId;
    
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
