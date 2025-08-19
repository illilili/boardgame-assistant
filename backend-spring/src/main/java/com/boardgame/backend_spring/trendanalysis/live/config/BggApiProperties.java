package com.boardgame.backend_spring.trendanalysis.live.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

/**
 * BGG API 호출 관련 설정 프로퍼티
 */
@Component
@ConfigurationProperties(prefix = "app.bgg-api")
@Data
public class BggApiProperties {
    
    /**
     * API 재시도 관련 설정
     */
    private Retry retry = new Retry();
    
    /**
     * API 요청 간격 관련 설정
     */
    private Request request = new Request();
    
    /**
     * 로깅 관련 설정
     */
    private Logging logging = new Logging();
    
    @Data
    public static class Retry {
        /**
         * 최대 재시도 횟수
         */
        private int maxAttempts = 3;
        
        /**
         * 초기 지연 시간 (밀리초)
         */
        private long initialDelay = 1000;
        
        /**
         * 지수 백오프 배율
         */
        private double multiplier = 2.0;
        
        /**
         * 최대 지연 시간 (밀리초)
         */
        private long maxDelay = 30000;
    }
    
    @Data
    public static class Request {
        /**
         * 순차적 요청 간 기본 지연 시간 (밀리초)
         */
        private long sequentialDelay = 2000;
        
        /**
         * API 응답 타임아웃 (밀리초)
         */
        private long timeout = 30000;
        
        /**
         * Rate limit 준수를 위한 최소 요청 간격 (밀리초)
         */
        private long minRequestInterval = 1000;
    }
    
    @Data
    public static class Logging {
        /**
         * 상세 로깅 활성화 여부
         */
        private boolean detailed = true;
        
        /**
         * 각 게임별 처리 결과 로깅 여부
         */
        private boolean individualResults = false;
        
        /**
         * API 응답 샘플 로깅 여부 (디버깅용)
         */
        private boolean responseBody = false;
    }
}