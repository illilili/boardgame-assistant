package com.boardgame.backend_spring.trendanalysis.live.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 비동기 번역 서비스
 * 게임 데이터를 먼저 반환하고, 번역을 백그라운드에서 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncTranslationService {

    private final PythonTranslationService pythonTranslationService;

    /**
     * 비동기로 게임 데이터 번역 처리
     * 메인 응답은 즉시 반환하고, 번역은 백그라운드에서 처리
     */
    @Async
    public CompletableFuture<Void> translateGameDataAsync(Map<String, Object> gameData) {
        try {
            log.debug("비동기 번역 시작: gameId={}", gameData.get("id"));
            
            // Python 번역 서비스 호출
            pythonTranslationService.translateGameData(gameData);
            
            log.debug("비동기 번역 완료: gameId={}", gameData.get("id"));
            
        } catch (Exception e) {
            log.error("비동기 번역 실패: gameId={}, error={}", gameData.get("id"), e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * 배치로 여러 게임 데이터 비동기 번역
     */
    @Async
    public CompletableFuture<Void> translateGameDataBatchAsync(List<Map<String, Object>> gamesData) {
        try {
            log.info("비동기 배치 번역 시작: {}개 게임", gamesData.size());
            
            // 배치 번역 처리
            pythonTranslationService.translateGameDataBatch(gamesData);
            
            log.info("비동기 배치 번역 완료: {}개 게임", gamesData.size());
            
        } catch (Exception e) {
            log.error("비동기 배치 번역 실패: {}개 게임, error={}", gamesData.size(), e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * 번역 서비스 상태 확인
     */
    public boolean isTranslationServiceAvailable() {
        try {
            return pythonTranslationService.isTranslationServiceHealthy();
        } catch (Exception e) {
            log.warn("번역 서비스 상태 확인 실패: {}", e.getMessage());
            return false;
        }
    }
}