package com.boardgame.backend_spring.trendanalysis.original.controller;

import com.boardgame.backend_spring.trendanalysis.common.dto.TrendResponse;
import com.boardgame.backend_spring.trendanalysis.original.service.InteractiveTrendService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 인터랙티브 트렌드 탐색 대시보드 컨트롤러
 * - 10,000개 데이터셋 기반 동적 필터링 및 시각화
 * - 기획자용 전략적 영감 가이드 시스템
 */
@RestController
@RequestMapping("/api/trends/interactive")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class InteractiveTrendController {
    
    private final InteractiveTrendService interactiveTrendService;
    
    /**
     * 통합 필터링 API
     * GET /api/trends/interactive/filter
     * 
     * @param complexityMin 최소 난이도 (기본값: 1.0)
     * @param complexityMax 최대 난이도 (기본값: 5.0)
     * @param players 플레이어 수 (쉼표 구분, 예: "2,3,4")
     * @param categories 카테고리 (쉼표 구분, 예: "Strategy Games,Card Games")
     * @param mechanics 메카닉 (쉼표 구분, 예: "Hand Management,Deck Building")
     * @param limit 결과 제한 (기본값: 500, 최대: 2000)
     * @param sortBy 정렬 기준 (기본값: geek_rating)
     * @param sortOrder 정렬 순서 (기본값: desc)
     * @return 필터링된 게임 목록 (품질 데이터 우선)
     */
    @GetMapping("/filter")
    public ResponseEntity<TrendResponse<List<Map<String, Object>>>> filterGames(
            @RequestParam(defaultValue = "1.0") Double complexityMin,
            @RequestParam(defaultValue = "5.0") Double complexityMax,
            @RequestParam(required = false) String players,
            @RequestParam(required = false) String categories,
            @RequestParam(required = false) String mechanics,
            @RequestParam(defaultValue = "500") Integer limit,
            @RequestParam(defaultValue = "geek_rating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        log.info("인터랙티브 필터링 API 호출: complexity=[{}-{}], players={}, categories={}, mechanics={}, limit={}, sort={}:{}", 
                complexityMin, complexityMax, players, categories, mechanics, limit, sortBy, sortOrder);
        
        // 최대 제한 검증
        if (limit > 2000) {
            limit = 2000;
            log.warn("요청된 limit이 최대값을 초과하여 2000으로 제한됨");
        }
        
        try {
            List<Map<String, Object>> filteredGames = interactiveTrendService.filterGames(
                complexityMin, complexityMax, players, categories, mechanics, limit, sortBy, sortOrder
            );
            
            TrendResponse<List<Map<String, Object>>> response = TrendResponse.success(
                filteredGames,
                String.format("필터링 완료: %d개 게임 조회", filteredGames.size())
            );
            
            log.info("인터랙티브 필터링 API 응답 완료: {}개 게임", filteredGames.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("인터랙티브 필터링 중 오류 발생", e);
            TrendResponse<List<Map<String, Object>>> errorResponse = TrendResponse.<List<Map<String, Object>>>builder()
                    .status("error")
                    .message("필터링 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 버블 차트용 집계 데이터 API
     * GET /api/trends/interactive/bubble-chart
     * 
     * @param groupBy 그룹화 기준 (categories 또는 mechanics)
     * @param complexityMin 최소 난이도
     * @param complexityMax 최대 난이도 
     * @param players 플레이어 수 필터
     * @param categories 카테고리 필터 (필터링된 게임과 동일한 조건 사용)
     * @param mechanics 메카닉 필터 (필터링된 게임과 동일한 조건 사용)
     * @param limit 게임 수 제한 (필터링된 게임과 동일한 조건 사용)
     * @return 버블 차트 데이터 (X: 평균 평점, Y: 평균 난이도, Size: 게임 수)
     */
    @GetMapping("/bubble-chart")
    public ResponseEntity<TrendResponse<List<Map<String, Object>>>> getBubbleChartData(
            @RequestParam(defaultValue = "categories") String groupBy,
            @RequestParam(defaultValue = "1.0") Double complexityMin,
            @RequestParam(defaultValue = "5.0") Double complexityMax,
            @RequestParam(required = false) String players,
            @RequestParam(required = false) String categories,
            @RequestParam(required = false) String mechanics,
            @RequestParam(defaultValue = "500") Integer limit) {
        
        log.info("버블 차트 데이터 API 호출: groupBy={}, complexity=[{}-{}], players={}, categories={}, mechanics={}, limit={}", 
                groupBy, complexityMin, complexityMax, players, categories, mechanics, limit);
        
        try {
            List<Map<String, Object>> bubbleData = interactiveTrendService.getBubbleChartData(
                groupBy, complexityMin, complexityMax, players, categories, mechanics, limit
            );
            
            TrendResponse<List<Map<String, Object>>> response = TrendResponse.success(
                bubbleData,
                String.format("버블 차트 데이터 생성 완료: %d개 그룹", bubbleData.size())
            );
            
            log.info("버블 차트 데이터 API 응답 완료: {}개 그룹", bubbleData.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("버블 차트 데이터 생성 중 오류 발생", e);
            TrendResponse<List<Map<String, Object>>> errorResponse = TrendResponse.<List<Map<String, Object>>>builder()
                    .status("error")
                    .message("버블 차트 데이터 생성 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 히트맵용 집계 데이터 API
     * GET /api/trends/interactive/heatmap
     * 
     * @param complexityMin 최소 난이도 (필터링된 게임과 동일한 조건 사용)
     * @param complexityMax 최대 난이도 (필터링된 게임과 동일한 조건 사용)
     * @param players 플레이어 수 필터 (필터링된 게임과 동일한 조건 사용)
     * @param categories 카테고리 필터 (필터링된 게임과 동일한 조건 사용)
     * @param mechanics 메카닉 필터 (필터링된 게임과 동일한 조건 사용)
     * @param limit 게임 수 제한 (필터링된 게임과 동일한 조건 사용)
     * @return 히트맵 데이터 (X: 플레이어 수, Y: 난이도 구간, Value: 게임 수)
     */
    
    
    /**
     * 전체 카테고리 목록 조회 API
     * GET /api/trends/interactive/categories
     * 
     * @return 모든 카테고리 목록 (검색 자동완성용)
     */
    @GetMapping("/categories")
    public ResponseEntity<TrendResponse<List<String>>> getAllCategories() {
        log.info("전체 카테고리 목록 API 호출");
        
        try {
            List<String> categories = interactiveTrendService.getAllCategories();
            
            TrendResponse<List<String>> response = TrendResponse.success(
                categories,
                String.format("카테고리 목록 조회 완료: %d개", categories.size())
            );
            
            log.info("전체 카테고리 목록 API 응답 완료: {}개", categories.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("카테고리 목록 조회 중 오류 발생", e);
            TrendResponse<List<String>> errorResponse = TrendResponse.<List<String>>builder()
                    .status("error")
                    .message("카테고리 목록 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 인기 카테고리 목록 조회 API (상위 25개)
     * GET /api/trends/interactive/categories/popular
     * 
     * @return 인기 카테고리 목록 (필터 UI 용)
     */
    @GetMapping("/categories/popular")
    public ResponseEntity<TrendResponse<List<String>>> getPopularCategories() {
        log.info("인기 카테고리 목록 API 호출");
        
        try {
            List<String> popularCategories = interactiveTrendService.getPopularCategories();
            
            TrendResponse<List<String>> response = TrendResponse.success(
                popularCategories,
                String.format("인기 카테고리 목록 조회 완료: %d개", popularCategories.size())
            );
            
            log.info("인기 카테고리 목록 API 응답 완료: {}개", popularCategories.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("인기 카테고리 목록 조회 중 오류 발생", e);
            TrendResponse<List<String>> errorResponse = TrendResponse.<List<String>>builder()
                    .status("error")
                    .message("인기 카테고리 목록 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 전체 메카닉 목록 조회 API
     * GET /api/trends/interactive/mechanics
     * 
     * @return 모든 메카닉 목록 (검색 자동완성용)
     */
    @GetMapping("/mechanics")
    public ResponseEntity<TrendResponse<List<String>>> getAllMechanics() {
        log.info("전체 메카닉 목록 API 호출");
        
        try {
            List<String> mechanics = interactiveTrendService.getAllMechanics();
            
            TrendResponse<List<String>> response = TrendResponse.success(
                mechanics,
                String.format("메카닉 목록 조회 완료: %d개", mechanics.size())
            );
            
            log.info("전체 메카닉 목록 API 응답 완료: {}개", mechanics.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("메카닉 목록 조회 중 오류 발생", e);
            TrendResponse<List<String>> errorResponse = TrendResponse.<List<String>>builder()
                    .status("error")
                    .message("메카닉 목록 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 인기 메카닉 목록 조회 API (상위 30개)
     * GET /api/trends/interactive/mechanics/popular
     * 
     * @return 인기 메카닉 목록 (필터 UI 용)
     */
    @GetMapping("/mechanics/popular")
    public ResponseEntity<TrendResponse<List<String>>> getPopularMechanics() {
        log.info("인기 메카닉 목록 API 호출");
        
        try {
            List<String> popularMechanics = interactiveTrendService.getPopularMechanics();
            
            TrendResponse<List<String>> response = TrendResponse.success(
                popularMechanics,
                String.format("인기 메카닉 목록 조회 완료: %d개", popularMechanics.size())
            );
            
            log.info("인기 메카닉 목록 API 응답 완료: {}개", popularMechanics.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("인기 메카닉 목록 조회 중 오류 발생", e);
            TrendResponse<List<String>> errorResponse = TrendResponse.<List<String>>builder()
                    .status("error")
                    .message("인기 메카닉 목록 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 헬스체크 API
     * GET /api/trends/interactive/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        log.info("인터랙티브 트렌드 - 헬스체크 API 호출");
        
        Map<String, Object> healthStatus = interactiveTrendService.getHealthStatus();
        
        if ("healthy".equals(healthStatus.get("status"))) {
            log.info("인터랙티브 트렌드 - 헬스체크 성공");
            return ResponseEntity.ok(healthStatus);
        } else {
            log.error("인터랙티브 트렌드 - 헬스체크 실패: {}", healthStatus.get("error"));
            return ResponseEntity.status(500).body(healthStatus);
        }
    }
}