package com.boardgame.backend_spring.trendanalysis.original.controller;

import com.boardgame.backend_spring.trendanalysis.common.dto.TrendResponse;
import com.boardgame.backend_spring.trendanalysis.original.dto.ThemeStatistic;
import com.boardgame.backend_spring.trendanalysis.original.dto.MechanismStatistic;
import com.boardgame.backend_spring.trendanalysis.original.dto.DifficultyDistribution;
import com.boardgame.backend_spring.trendanalysis.original.dto.PlayerCountDistribution;
import com.boardgame.backend_spring.trendanalysis.original.service.OriginalTrendService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 10,000개 데이터셋 기반 기존 보드게임 트렌드 분석 컨트롤러
 * - 실시간 트렌드 요약 (The Overview)
 */
@RestController
@RequestMapping("/api/trends/original")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class OriginalTrendController {
    
    private final OriginalTrendService originalTrendService;
    
    /**
     * 인기 테마 상위 10개 조회
     * GET /api/trends/original/themes
     */
    @GetMapping("/themes")
    public ResponseEntity<TrendResponse<List<ThemeStatistic>>> getPopularThemes() {
        log.info("기존 데이터셋 - 인기 테마 API 호출");
        
        try {
            List<ThemeStatistic> themes = originalTrendService.getPopularThemes();
            
            TrendResponse<List<ThemeStatistic>> response = TrendResponse.success(
                themes, 
                "인기 테마 " + themes.size() + "개 조회 완료"
            );
            
            log.info("기존 데이터셋 - 인기 테마 API 응답 완료: {}개", themes.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 인기 테마 조회 중 오류 발생", e);
            TrendResponse<List<ThemeStatistic>> errorResponse = TrendResponse.<List<ThemeStatistic>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 인기 메커니즘 상위 10개 조회
     * GET /api/trends/original/mechanisms
     */
    @GetMapping("/mechanisms")
    public ResponseEntity<TrendResponse<List<MechanismStatistic>>> getPopularMechanisms() {
        log.info("기존 데이터셋 - 인기 메커니즘 API 호출");
        
        try {
            List<MechanismStatistic> mechanisms = originalTrendService.getPopularMechanisms();
            
            TrendResponse<List<MechanismStatistic>> response = TrendResponse.success(
                mechanisms, 
                "인기 메커니즘 " + mechanisms.size() + "개 조회 완료"
            );
            
            log.info("기존 데이터셋 - 인기 메커니즘 API 응답 완료: {}개", mechanisms.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 인기 메커니즘 조회 중 오류 발생", e);
            TrendResponse<List<MechanismStatistic>> errorResponse = TrendResponse.<List<MechanismStatistic>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 난이도 분포 조회
     * GET /api/trends/original/difficulty
     */
    @GetMapping("/difficulty")
    public ResponseEntity<TrendResponse<List<DifficultyDistribution>>> getDifficultyDistribution() {
        log.info("기존 데이터셋 - 난이도 분포 API 호출");
        
        try {
            List<DifficultyDistribution> distribution = originalTrendService.getDifficultyDistribution();
            
            TrendResponse<List<DifficultyDistribution>> response = TrendResponse.success(
                distribution,
                "난이도 분포 " + distribution.size() + "개 구간 조회 완료"
            );
            
            log.info("기존 데이터셋 - 난이도 분포 API 응답 완료: {}개 구간", distribution.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 난이도 분포 조회 중 오류 발생", e);
            TrendResponse<List<DifficultyDistribution>> errorResponse = TrendResponse.<List<DifficultyDistribution>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 플레이어 수 분포 조회
     * GET /api/trends/original/players
     */
    @GetMapping("/players")
    public ResponseEntity<TrendResponse<List<PlayerCountDistribution>>> getPlayerCountDistribution() {
        log.info("기존 데이터셋 - 플레이어 수 분포 API 호출");
        
        try {
            List<PlayerCountDistribution> distribution = originalTrendService.getPlayerCountDistribution();
            
            TrendResponse<List<PlayerCountDistribution>> response = TrendResponse.success(
                distribution,
                "플레이어 수 분포 " + distribution.size() + "개 구간 조회 완료"
            );
            
            log.info("기존 데이터셋 - 플레이어 수 분포 API 응답 완료: {}개 구간", distribution.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 플레이어 수 분포 조회 중 오류 발생", e);
            TrendResponse<List<PlayerCountDistribution>> errorResponse = TrendResponse.<List<PlayerCountDistribution>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 헬스체크
     * GET /api/trends/original/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        log.info("기존 데이터셋 - 헬스체크 API 호출");
        
        Map<String, Object> healthStatus = originalTrendService.getHealthStatus();
        
        if ("healthy".equals(healthStatus.get("status"))) {
            log.info("기존 데이터셋 - 헬스체크 성공: 총 {}개 게임", healthStatus.get("totalGames"));
            return ResponseEntity.ok(healthStatus);
        } else {
            log.error("기존 데이터셋 - 헬스체크 실패: {}", healthStatus.get("error"));
            return ResponseEntity.status(500).body(healthStatus);
        }
    }
    
    /**
     * 전체 트렌드 데이터 조회 (대시보드용)
     * GET /api/trends/original/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<TrendResponse<Map<String, Object>>> getDashboardData() {
        log.info("기존 데이터셋 - 대시보드 데이터 API 호출");
        
        try {
            // 모든 트렌드 데이터를 한 번에 조회
            List<ThemeStatistic> themes = originalTrendService.getPopularThemes();
            List<MechanismStatistic> mechanisms = originalTrendService.getPopularMechanisms();
            List<DifficultyDistribution> difficulty = originalTrendService.getDifficultyDistribution();
            List<PlayerCountDistribution> players = originalTrendService.getPlayerCountDistribution();
            Map<String, Object> health = originalTrendService.getHealthStatus();
            
            Map<String, Object> dashboardData = Map.of(
                "themes", themes,
                "mechanisms", mechanisms,
                "difficulty", difficulty,
                "players", players,
                "health", health
            );
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                dashboardData,
                "기존 데이터셋 대시보드 데이터 조회 완료"
            );
            
            log.info("기존 데이터셋 - 대시보드 데이터 API 응답 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 대시보드 데이터 조회 중 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("대시보드 데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 평점 분포 조회
     * GET /api/trends/original/ratings
     */
    @GetMapping("/ratings")
    public ResponseEntity<TrendResponse<List<Map<String, Object>>>> getRatingDistribution() {
        log.info("기존 데이터셋 - 평점 분포 API 호출");
        
        try {
            List<Map<String, Object>> distribution = originalTrendService.getRatingDistribution();
            
            TrendResponse<List<Map<String, Object>>> response = TrendResponse.success(
                distribution,
                "평점 분포 " + distribution.size() + "개 구간 조회 완료"
            );
            
            log.info("기존 데이터셋 - 평점 분포 API 응답 완료: {}개 구간", distribution.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 평점 분포 조회 중 오류 발생", e);
            TrendResponse<List<Map<String, Object>>> errorResponse = TrendResponse.<List<Map<String, Object>>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 연도별 게임 분포 조회
     * GET /api/trends/original/yearly
     */
    @GetMapping("/yearly")
    public ResponseEntity<TrendResponse<List<Map<String, Object>>>> getYearlyDistribution() {
        log.info("기존 데이터셋 - 연도별 게임 분포 API 호출");
        
        try {
            List<Map<String, Object>> distribution = originalTrendService.getYearlyGameDistribution();
            
            TrendResponse<List<Map<String, Object>>> response = TrendResponse.success(
                distribution,
                "연도별 게임 분포 " + distribution.size() + "개 연도 조회 완료"
            );
            
            log.info("기존 데이터셋 - 연도별 게임 분포 API 응답 완료: {}개 연도", distribution.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 연도별 게임 분포 조회 중 오류 발생", e);
            TrendResponse<List<Map<String, Object>>> errorResponse = TrendResponse.<List<Map<String, Object>>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 상위 평점 게임 조회
     * GET /api/trends/original/top-games?limit=10
     */
    @GetMapping("/top-games")
    public ResponseEntity<TrendResponse<List<Map<String, Object>>>> getTopRatedGames(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("기존 데이터셋 - 상위 평점 게임 API 호출, limit: {}", limit);
        
        try {
            // 최대 50개까지 제한
            int actualLimit = Math.min(Math.max(limit, 1), 50);
            
            List<Map<String, Object>> topGames = originalTrendService.getTopRatedGames(actualLimit);
            
            TrendResponse<List<Map<String, Object>>> response = TrendResponse.success(
                topGames,
                "상위 평점 게임 " + topGames.size() + "개 조회 완료"
            );
            
            log.info("기존 데이터셋 - 상위 평점 게임 API 응답 완료: {}개", topGames.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 상위 평점 게임 조회 중 오류 발생", e);
            TrendResponse<List<Map<String, Object>>> errorResponse = TrendResponse.<List<Map<String, Object>>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 대시보드 요약 통계 조회
     * GET /api/trends/original/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<TrendResponse<Map<String, Object>>> getDashboardSummary() {
        log.info("기존 데이터셋 - 대시보드 요약 통계 API 호출");
        
        try {
            Map<String, Object> summary = originalTrendService.getDashboardSummary();
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                summary,
                "대시보드 요약 통계 조회 완료"
            );
            
            log.info("기존 데이터셋 - 대시보드 요약 통계 API 응답 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 대시보드 요약 통계 조회 중 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 전체 통합 대시보드 데이터 조회 (향상된 버전)
     * GET /api/trends/original/full-dashboard
     */
    @GetMapping("/full-dashboard")
    public ResponseEntity<TrendResponse<Map<String, Object>>> getFullDashboardData() {
        log.info("기존 데이터셋 - 전체 통합 대시보드 데이터 API 호출");
        
        try {
            // 모든 분석 데이터를 한 번에 조회
            List<ThemeStatistic> themes = originalTrendService.getPopularThemes();
            List<MechanismStatistic> mechanisms = originalTrendService.getPopularMechanisms();
            List<DifficultyDistribution> difficulty = originalTrendService.getDifficultyDistribution();
            List<PlayerCountDistribution> players = originalTrendService.getPlayerCountDistribution();
            List<Map<String, Object>> ratings = originalTrendService.getRatingDistribution();
            List<Map<String, Object>> yearly = originalTrendService.getYearlyGameDistribution();
            List<Map<String, Object>> topGames = originalTrendService.getTopRatedGames(10);
            Map<String, Object> summary = originalTrendService.getDashboardSummary();
            Map<String, Object> health = originalTrendService.getHealthStatus();
            
            Map<String, Object> fullDashboard = Map.of(
                "themes", themes,
                "mechanisms", mechanisms,
                "difficulty", difficulty,
                "players", players,
                "ratings", ratings,
                "yearly", yearly,
                "topGames", topGames,
                "summary", summary,
                "health", health
            );
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                fullDashboard,
                "전체 통합 대시보드 데이터 조회 완료"
            );
            
            log.info("기존 데이터셋 - 전체 통합 대시보드 데이터 API 응답 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 전체 통합 대시보드 데이터 조회 중 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("전체 대시보드 데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}