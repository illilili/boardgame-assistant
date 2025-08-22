package com.boardgame.backend_spring.trendanalysis.live.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * BGG API를 통한 게임 데이터 수집 결과를 추적하는 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameFetchResult {
    
    /**
     * 전체 처리해야 할 게임 수
     */
    private int totalGames;
    
    /**
     * 성공적으로 수집된 게임 수
     */
    private int successCount;
    
    /**
     * 실패한 게임 수
     */
    private int failureCount;
    
    /**
     * 성공적으로 수집된 게임 데이터 목록
     */
    @Builder.Default
    private List<Map<String, Object>> successfulGames = new ArrayList<>();
    
    /**
     * 실패한 게임들의 상세 정보
     */
    @Builder.Default
    private List<FailedGame> failedGames = new ArrayList<>();
    
    /**
     * 전체 처리 시간 (밀리초)
     */
    private long processingTimeMs;
    
    /**
     * 성공률 (백분율)
     */
    public double getSuccessRate() {
        if (totalGames == 0) return 0.0;
        return (double) successCount / totalGames * 100.0;
    }
    
    /**
     * 실패한 게임 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailedGame {
        /**
         * 게임 ID
         */
        private String gameId;
        
        /**
         * 실패 사유
         */
        private String reason;
        
        /**
         * 시도 횟수
         */
        private int attempts;
        
        /**
         * 최종 오류 메시지
         */
        private String errorMessage;
    }
}