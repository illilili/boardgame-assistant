package com.boardgame.backend_spring.trendanalysis.live.controller;

import com.boardgame.backend_spring.trendanalysis.common.dto.TrendResponse;
import com.boardgame.backend_spring.trendanalysis.live.service.BoardGameGeekApiService;
import com.boardgame.backend_spring.trendanalysis.live.service.PythonTranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 실시간 BGG API 기반 트렌드 분석 컨트롤러
 * - TOP 50 실시간 랭킹 (The Evidence)
 * - 상세 정보 모달 (The Deep Dive)
 */
@RestController
@RequestMapping("/api/trends/live")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class LiveTrendController {
    
    private final BoardGameGeekApiService bggApiService;
    private final PythonTranslationService pythonTranslationService;
    
    /**
     * TOP 50 게임 데이터 조회 (Hot Games 기반 - 성능 최적화)
     * GET /api/trends/live/top50
     */
    @GetMapping("/top50")
    public ResponseEntity<TrendResponse<Map<String, Object>>> getTop50Data() {
        log.info("실시간 TOP 50 게임 데이터 API 호출 (Hot Games 기반)");
        
        try {
            // Hot Games API 사용으로 성능 최적화 (30개 한 번에 조회) - 안정성 우선
            java.util.List<Map<String, Object>> hotGames = bggApiService.getHotGames(30);
            
            if (hotGames.isEmpty()) {
                log.warn("Hot Games API에서 데이터를 가져오지 못했습니다");
                // 빈 데이터 응답 생성
                Map<String, Object> emptyTrendSummary = new java.util.HashMap<>();
                emptyTrendSummary.put("totalHotGames", 0);
                emptyTrendSummary.put("source", "BGG Hot List API");
                emptyTrendSummary.put("updateFrequency", "실시간");
                emptyTrendSummary.put("averageComplexity", 0.0);
                emptyTrendSummary.put("popularPlayerCount", 4);
                emptyTrendSummary.put("mainGenre", "데이터 없음");
                emptyTrendSummary.put("hotMechanic", "데이터 없음");
                emptyTrendSummary.put("averageRating", 0.0);
                
                Map<String, Object> responseData = Map.of(
                    "games", new java.util.ArrayList<>(),
                    "trendSummary", emptyTrendSummary,
                    "totalGames", 0,
                    "source", "BGG Hot List API (최적화) - 데이터 없음",
                    "lastFetched", new java.util.Date()
                );
                
                TrendResponse<Map<String, Object>> response = TrendResponse.success(
                    responseData,
                    "실시간 TOP 50 게임 데이터 조회 완료: 0개 (데이터 없음)"
                );
                
                return ResponseEntity.ok(response);
            }
            
            // Hot Games 데이터와 상세 정보를 결합하여 실제 트렌드 요약 계산
            Map<String, Object> trendSummary = calculateEnhancedTrendSummary(hotGames);
            
            Map<String, Object> responseData = Map.of(
                "games", hotGames,
                "trendSummary", trendSummary,
                "totalGames", hotGames.size(),
                "source", "BGG Hot List API (최적화)",
                "lastFetched", new java.util.Date()
            );
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                responseData,
                String.format("실시간 TOP 50 게임 데이터 조회 완료: %d개", hotGames.size())
            );
            
            log.info("실시간 TOP 50 게임 데이터 API 응답 완료: {} 개", hotGames.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("실시간 TOP 50 게임 데이터 조회 중 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("실시간 데이터 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 배치 게임 상세 정보 조회 - 성능 최적화
     * POST /api/trends/live/game-details-batch
     */
    @PostMapping("/game-details-batch")
    public ResponseEntity<TrendResponse<Map<String, Object>>> getGameDetailsBatch(
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        List<String> gameIds = (List<String>) request.get("gameIds");
        
        if (gameIds == null || gameIds.isEmpty()) {
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("게임 ID 목록이 비어있습니다")
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        log.info("배치 게임 상세 정보 API 호출: {} 개 게임", gameIds.size());
        
        try {
            // 배치 사이즈 제한 (BGG API 안정성 고려)
            if (gameIds.size() > 25) {
                log.warn("배치 사이즈 초과: {} 개 (최대 25개)", gameIds.size());
                gameIds = gameIds.subList(0, 25);
            }
            
            Map<String, Object> batchResult = bggApiService.getGameDetailsBatch(gameIds);
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                batchResult,
                String.format("배치 게임 상세 정보 조회 완료: %d개 요청, %d개 성공", 
                    gameIds.size(), 
                    batchResult.containsKey("games") ? 
                        ((java.util.List<?>) batchResult.get("games")).size() : 0)
            );
            
            log.info("배치 게임 상세 정보 API 응답 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("배치 게임 상세 정보 조회 중 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("배치 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * 개별 게임 상세 정보 조회 (기존 API 유지)
     * GET /api/trends/live/game-detail/{gameId}
     */
    @GetMapping("/game-detail/{gameId}")
    public ResponseEntity<TrendResponse<Map<String, Object>>> getGameDetail(@PathVariable String gameId) {
        log.info("실시간 게임 상세 정보 API 호출: gameId={}", gameId);
        
        try {
            Map<String, Object> gameDetail = bggApiService.getGameDetail(gameId);
            
            if (gameDetail.isEmpty()) {
                TrendResponse<Map<String, Object>> notFoundResponse = TrendResponse.<Map<String, Object>>builder()
                        .status("not_found")
                        .message("게임을 찾을 수 없습니다: " + gameId)
                        .data(null)
                        .cached(false)
                        .build();
                
                return ResponseEntity.status(404).body(notFoundResponse);
            }
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                gameDetail,
                String.format("게임 상세 정보 조회 완료: %s", gameDetail.get("name"))
            );
            
            log.info("실시간 게임 상세 정보 API 응답 완료: gameId={}", gameId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("실시간 게임 상세 정보 조회 중 오류 발생: gameId={}", gameId, e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("게임 상세 정보 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * BGG Hot Games 조회
     * GET /api/trends/live/hot-games?limit=20
     */
    @GetMapping("/hot-games")
    public ResponseEntity<TrendResponse<Map<String, Object>>> getHotGames(
            @RequestParam(defaultValue = "20") int limit) {
        log.info("실시간 BGG Hot Games API 호출: {} 개", limit);
        
        try {
            java.util.List<Map<String, Object>> hotGames = bggApiService.getHotGames(limit);
            
            Map<String, Object> responseData = Map.of(
                "hotGames", hotGames,
                "totalGames", hotGames.size(),
                "limit", limit,
                "source", "BGG Hot List API",
                "lastFetched", new java.util.Date()
            );
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                responseData,
                String.format("BGG Hot Games %d개 조회 완료", hotGames.size())
            );
            
            log.info("실시간 BGG Hot Games API 응답 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("실시간 BGG Hot Games 조회 중 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("BGG Hot Games 조회 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Hot Games 데이터만으로 기본적인 트렌드 요약 계산
     * Hot Games API는 기본 정보만 제공하므로 연도 기반 분석과 기본값 사용
     */
    private Map<String, Object> calculateBasicTrendSummary(java.util.List<Map<String, Object>> hotGames) {
        Map<String, Object> summary = new java.util.HashMap<>();
        
        try {
            // 기본 메트릭 설정
            summary.put("totalHotGames", hotGames.size());
            summary.put("source", "BGG Hot List API");
            summary.put("updateFrequency", "실시간");
            
            // Hot Games는 상세 정보가 없으므로 인기 기반 기본값 설정
            summary.put("averageComplexity", 2.5); // 보통 복잡도
            summary.put("popularPlayerCount", 4);   // 가장 인기있는 인원수 (기본값)
            summary.put("mainGenre", "전략게임");    // Hot Games 특성상 전략게임이 많음
            summary.put("hotMechanic", "덱 빌딩"); // 인기 메카닉
            summary.put("averageRating", 7.5);     // Hot Games 평균 평점 추정값
            
            // 연도별 분석 (사용 가능한 데이터)
            long recentGamesCount = hotGames.stream()
                .filter(game -> {
                    Object year = game.get("yearPublished");
                    if (year instanceof Number) {
                        return ((Number) year).intValue() >= 2023; // 최신 게임 기준
                    }
                    return false;
                })
                .count();
            
            double recentGamesPercentage = hotGames.size() > 0 
                ? Math.round((recentGamesCount * 100.0 / hotGames.size()) * 10.0) / 10.0 
                : 0.0;
            
            summary.put("recentGamesCount", recentGamesCount);
            summary.put("recentGamesPercentage", recentGamesPercentage);
            
            // 추가 통계
            summary.put("totalGames", hotGames.size());
            
            log.info("기본 트렌드 요약 계산 완료 - 전체: {}개, 최신게임: {}개 ({}%)", 
                hotGames.size(), recentGamesCount, recentGamesPercentage);
            
        } catch (Exception e) {
            log.error("기본 트렌드 요약 계산 중 오류 발생", e);
            // 오류 시 기본값 설정
            summary.put("totalHotGames", hotGames.size());
            summary.put("source", "BGG Hot List API");
            summary.put("updateFrequency", "실시간");
            summary.put("averageComplexity", 2.5);
            summary.put("popularPlayerCount", 4);
            summary.put("mainGenre", "전략게임");
            summary.put("hotMechanic", "덱 빌딩");
            summary.put("averageRating", 7.5);
            summary.put("recentGamesCount", 0L);
            summary.put("recentGamesPercentage", 0.0);
            summary.put("totalGames", hotGames.size());
        }
        
        return summary;
    }
    
    /**
     * Hot Games 데이터와 상세 정보를 결합한 향상된 트렌드 요약 계산
     * 실제 categories, mechanics 데이터를 활용하여 TOP3 계산
     */
    private Map<String, Object> calculateEnhancedTrendSummary(java.util.List<Map<String, Object>> hotGames) {
        Map<String, Object> summary = new java.util.HashMap<>();
        
        try {
            log.info("향상된 트렌드 요약 계산 시작: {}개 Hot Games", hotGames.size());
            
            // 기본 메트릭 설정
            summary.put("totalHotGames", hotGames.size());
            summary.put("source", "BGG Hot List + Thing API");
            summary.put("updateFrequency", "실시간");
            
            // Hot Games ID 추출 (상세 정보 조회용)
            java.util.List<String> gameIds = hotGames.stream()
                .map(game -> String.valueOf(game.get("id")))
                .collect(java.util.stream.Collectors.toList());
            
            // 상세 정보 배치 조회 (categories, mechanics 포함)
            Map<String, Object> detailsResult = bggApiService.getGameDetailsBatch(gameIds);
            
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> detailedGames = 
                (java.util.List<Map<String, Object>>) detailsResult.get("games");
            
            if (detailedGames != null && !detailedGames.isEmpty()) {
                log.info("상세 정보 조회 성공: {}/{}개 게임", detailedGames.size(), gameIds.size());
                
                // 실제 데이터 기반 트렌드 계산
                calculateRealTrendMetrics(detailedGames, summary);
            } else {
                log.warn("상세 정보 조회 실패, 기본값 사용");
                // 폴백: 기본값 설정
                setDefaultTrendMetrics(summary);
            }
            
            // Hot Games 기반 기본 메트릭 (연도별 분석 등)
            calculateBasicMetrics(hotGames, summary);
            
            log.info("향상된 트렌드 요약 계산 완료");
            
        } catch (Exception e) {
            log.error("향상된 트렌드 요약 계산 중 오류 발생", e);
            // 오류 시 기본값 설정
            setDefaultTrendMetrics(summary);
            calculateBasicMetrics(hotGames, summary);
        }
        
        return summary;
    }
    
    /**
     * 실제 게임 데이터 기반 트렌드 메트릭 계산 (TOP3 포함)
     */
    private void calculateRealTrendMetrics(java.util.List<Map<String, Object>> games, Map<String, Object> summary) {
        // 1. 평균 복잡도 계산
        double avgComplexity = games.stream()
            .filter(game -> game.get("averageWeight") != null)
            .mapToDouble(game -> ((Number) game.get("averageWeight")).doubleValue())
            .average()
            .orElse(2.5);
        summary.put("averageComplexity", Math.round(avgComplexity * 100.0) / 100.0);
        
        // 2. 인기 플레이어 수 계산
        Map<Integer, Long> playerCountFreq = games.stream()
            .filter(game -> game.get("maxPlayers") != null)
            .collect(java.util.stream.Collectors.groupingBy(
                game -> ((Number) game.get("maxPlayers")).intValue(),
                java.util.stream.Collectors.counting()
            ));
        
        Integer popularPlayerCount = playerCountFreq.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(4);
        summary.put("popularPlayerCount", popularPlayerCount);
        
        // 3. 주류 장르 TOP3 계산
        Map<String, Long> categoryFreq = new java.util.HashMap<>();
        games.stream()
            .filter(game -> game.get("categories") != null)
            .forEach(game -> {
                @SuppressWarnings("unchecked")
                java.util.List<String> categories = (java.util.List<String>) game.get("categories");
                categories.forEach(category -> 
                    categoryFreq.put(category, categoryFreq.getOrDefault(category, 0L) + 1)
                );
            });
        
        java.util.List<String> topGenres = categoryFreq.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(java.util.stream.Collectors.toList());
            
        // 최소 1개는 보장
        if (topGenres.isEmpty()) {
            topGenres = java.util.Arrays.asList("전략게임");
        }
        // Python 번역 서비스를 통한 장르 번역
        java.util.List<String> translatedGenres = translateTerms(topGenres, "categories");
        summary.put("topGenres", translatedGenres);
        summary.put("mainGenre", translatedGenres.isEmpty() ? "전략게임" : translatedGenres.get(0)); // 기존 호환성 유지
        
        // 4. 뜨거운 메카닉 TOP3 계산
        Map<String, Long> mechanicFreq = new java.util.HashMap<>();
        games.stream()
            .filter(game -> game.get("mechanics") != null)
            .forEach(game -> {
                @SuppressWarnings("unchecked")
                java.util.List<String> mechanics = (java.util.List<String>) game.get("mechanics");
                mechanics.forEach(mechanic -> 
                    mechanicFreq.put(mechanic, mechanicFreq.getOrDefault(mechanic, 0L) + 1)
                );
            });
        
        java.util.List<String> topMechanics = mechanicFreq.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(java.util.stream.Collectors.toList());
            
        // 최소 1개는 보장
        if (topMechanics.isEmpty()) {
            topMechanics = java.util.Arrays.asList("덱 빌딩");
        }
        // Python 번역 서비스를 통한 메카닉 번역
        java.util.List<String> translatedMechanics = translateTerms(topMechanics, "mechanics");
        summary.put("topMechanics", translatedMechanics);
        summary.put("hotMechanic", translatedMechanics.isEmpty() ? "덱 빌딩" : translatedMechanics.get(0)); // 기존 호환성 유지
        
        // 5. 평균 평점 계산
        double avgRating = games.stream()
            .filter(game -> game.get("averageRating") != null)
            .mapToDouble(game -> ((Number) game.get("averageRating")).doubleValue())
            .average()
            .orElse(7.5);
        summary.put("averageRating", Math.round(avgRating * 100.0) / 100.0);
        
        log.info("실제 데이터 기반 트렌드 계산 완료 - 장르 TOP3: {}, 메카닉 TOP3: {}", topGenres, topMechanics);
    }
    
    /**
     * 기본값 설정 (오류 시 또는 데이터 없을 때)
     */
    private void setDefaultTrendMetrics(Map<String, Object> summary) {
        summary.put("averageComplexity", 2.5);
        summary.put("popularPlayerCount", 4);
        summary.put("topGenres", java.util.Arrays.asList("전략게임", "테마게임", "카드게임"));
        summary.put("mainGenre", "전략게임");
        summary.put("topMechanics", java.util.Arrays.asList("덱 빌딩", "타일 배치", "손 관리"));
        summary.put("hotMechanic", "덱 빌딩");
        summary.put("averageRating", 7.5);
    }
    
    /**
     * Hot Games 기반 기본 메트릭 계산 (연도별 분석 등)
     */
    private void calculateBasicMetrics(java.util.List<Map<String, Object>> hotGames, Map<String, Object> summary) {
        // 연도별 분석
        long recentGamesCount = hotGames.stream()
            .filter(game -> {
                Object year = game.get("yearPublished");
                if (year instanceof Number) {
                    return ((Number) year).intValue() >= 2023;
                }
                return false;
            })
            .count();
        
        double recentGamesPercentage = hotGames.size() > 0 
            ? Math.round((recentGamesCount * 100.0 / hotGames.size()) * 10.0) / 10.0 
            : 0.0;
        
        summary.put("recentGamesCount", recentGamesCount);
        summary.put("recentGamesPercentage", recentGamesPercentage);
        summary.put("totalGames", hotGames.size());
    }
    
    /**
     * 게임 상세 정보 번역 API
     * POST /api/trends/live/translate-game/{gameId}
     */
    @PostMapping("/translate-game/{gameId}")
    public ResponseEntity<TrendResponse<Map<String, Object>>> translateSingleGame(@PathVariable String gameId) {
        log.info("게임 번역 API 호출: gameId={}", gameId);
        
        try {
            // 게임 상세 정보 조회
            Map<String, Object> gameDetail = bggApiService.getGameDetail(gameId);
            
            if (gameDetail.isEmpty()) {
                TrendResponse<Map<String, Object>> notFoundResponse = TrendResponse.<Map<String, Object>>builder()
                        .status("not_found")
                        .message("게임을 찾을 수 없습니다: " + gameId)
                        .data(null)
                        .cached(false)
                        .build();
                
                return ResponseEntity.status(404).body(notFoundResponse);
            }
            
            // Python 번역 서비스 적용
            pythonTranslationService.translateGameData(gameDetail);
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                gameDetail,
                String.format("게임 번역 완료: %s", gameDetail.get("name"))
            );
            
            log.info("게임 번역 API 응답 완료: gameId={}", gameId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("게임 번역 API 오류 발생: gameId={}", gameId, e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("게임 번역 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Python 번역 서비스 상태 확인
     * GET /api/trends/live/translation-health
     */
    @GetMapping("/translation-health")
    public ResponseEntity<Map<String, Object>> checkTranslationHealth() {
        try {
            boolean isHealthy = pythonTranslationService.isTranslationServiceHealthy();
            
            Map<String, Object> healthStatus = new HashMap<>();
            healthStatus.put("status", isHealthy ? "healthy" : "unavailable");
            healthStatus.put("service", "python_translation");
            healthStatus.put("timestamp", new java.util.Date());
            
            return ResponseEntity.ok(healthStatus);
            
        } catch (Exception e) {
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("status", "error");
            errorStatus.put("service", "python_translation");
            errorStatus.put("error", e.getMessage());
            errorStatus.put("timestamp", new java.util.Date());
            
            return ResponseEntity.status(500).body(errorStatus);
        }
    }
    
    /**
     * 게임 설명만 번역 API
     * POST /api/trends/live/translate-description
     */
    @PostMapping("/translate-description")
    public ResponseEntity<TrendResponse<Map<String, Object>>> translateDescription(
            @RequestBody Map<String, Object> request) {
        
        log.info("게임 설명 번역 API 호출");
        
        try {
            String description = (String) request.get("description");
            
            if (description == null || description.trim().isEmpty()) {
                TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                        .status("error")
                        .message("번역할 설명이 없습니다")
                        .data(null)
                        .cached(false)
                        .build();
                
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            log.info("설명 번역 시작: {}글자", description.length());
            
            String translatedDescription = pythonTranslationService.translateDescriptionOnly(description);
            
            Map<String, Object> result = new HashMap<>();
            result.put("original", description);
            result.put("translated", translatedDescription);
            result.put("success", true);
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                result,
                "게임 설명 번역 완료"
            );
            
            log.info("게임 설명 번역 API 응답 완료: {}글자", translatedDescription.length());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("게임 설명 번역 API 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("설명 번역 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * TOP 30 게임 전체 번역 API
     * POST /api/trends/live/translate-all-games
     */
    @PostMapping("/translate-all-games")
    public ResponseEntity<TrendResponse<Map<String, Object>>> translateAllGames(
            @RequestBody Map<String, Object> request) {
        
        log.info("TOP 30 전체 게임 번역 API 호출");
        
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> games = (List<Map<String, Object>>) request.get("games");
            
            if (games == null || games.isEmpty()) {
                TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                        .status("error")
                        .message("번역할 게임 데이터가 없습니다")
                        .data(null)
                        .cached(false)
                        .build();
                
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            log.info("전체 게임 번역 시작: {}개 게임 (병렬 처리)", games.size());
            
            // 원본 게임 데이터 디버깅 로그
            log.info("원본 게임 리스트 (처음 5개): ");
            for (int i = 0; i < Math.min(5, games.size()); i++) {
                Map<String, Object> game = games.get(i);
                log.info("  [{}] ID: {}, Name: {}, Rank: {}", 
                    i, game.get("id"), game.get("name"), game.get("rank"));
            }
            if (games.size() >= 25) {
                log.info("원본 게임 리스트 (마지막 5개): ");
                for (int i = Math.max(25, games.size() - 5); i < games.size(); i++) {
                    Map<String, Object> game = games.get(i);
                    log.info("  [{}] ID: {}, Name: {}, Rank: {}", 
                        i, game.get("id"), game.get("name"), game.get("rank"));
                }
            }
            
            // 병렬 처리를 위한 결과 저장 (effectively final로 선언)
            final List<Map<String, Object>> finalTranslatedGames = new ArrayList<>(games.size());
            final int[] successCount = {0};
            final int[] failureCount = {0};
            
            // 최적화된 배치 번역 - 한 번의 API 호출로 모든 게임 번역
            List<Map<String, Object>> translatedGames;
            try {
                translatedGames = pythonTranslationService.translateGamesOptimized(games);
                
                // 번역된 게임 수가 원본과 다른 경우 로그 기록
                if (translatedGames.size() != games.size()) {
                    log.warn("번역 후 게임 수 불일치: 원본 {}개 → 번역 후 {}개", games.size(), translatedGames.size());
                    // 번역된 게임 수를 원본 크기로 맞추기 위해 누락된 게임들을 원본으로 추가
                    if (translatedGames.size() < games.size()) {
                        int missingCount = games.size() - translatedGames.size();
                        List<Map<String, Object>> restoredTranslatedGames = new ArrayList<>(translatedGames);
                        for (int i = translatedGames.size(); i < games.size(); i++) {
                            restoredTranslatedGames.add(games.get(i)); // 원본 데이터 추가
                        }
                        translatedGames = restoredTranslatedGames;
                        log.info("누락된 게임 {}개를 원본으로 복원", missingCount);
                    }
                }
                
                successCount[0] = translatedGames.size();
                failureCount[0] = 0; // 복원했으므로 실패 카운트는 0
                
                log.info("최적화된 번역 완료: {}개 게임", translatedGames.size());
                
                // 번역된 게임 데이터 디버깅 로그
                log.info("번역된 게임 리스트 (처음 5개): ");
                for (int i = 0; i < Math.min(5, translatedGames.size()); i++) {
                    Map<String, Object> game = translatedGames.get(i);
                    log.info("  [{}] ID: {}, Name: {}, Rank: {}", 
                        i, game.get("id"), game.get("name"), game.get("rank"));
                }
                if (translatedGames.size() >= 25) {
                    log.info("번역된 게임 리스트 (마지막 5개): ");
                    for (int i = Math.max(25, translatedGames.size() - 5); i < translatedGames.size(); i++) {
                        Map<String, Object> game = translatedGames.get(i);
                        log.info("  [{}] ID: {}, Name: {}, Rank: {}", 
                            i, game.get("id"), game.get("name"), game.get("rank"));
                    }
                }
                
            } catch (Exception e) {
                log.error("최적화된 배치 번역 실패, 개별 번역으로 폴백: {}", e.getMessage());
                
                // 폴백: 병렬 스트림을 사용한 개별 번역
                games.parallelStream().forEach(game -> {
                    try {
                        @SuppressWarnings("unchecked")
                        List<String> categories = (List<String>) game.get("categories");
                        @SuppressWarnings("unchecked")
                        List<String> mechanics = (List<String>) game.get("mechanics");
                        
                        if ((categories != null && !categories.isEmpty()) || 
                            (mechanics != null && !mechanics.isEmpty())) {
                            
                            Map<String, Object> gameForTranslation = new HashMap<>(game);
                            pythonTranslationService.translateGameData(gameForTranslation);
                            
                            synchronized (finalTranslatedGames) {
                                finalTranslatedGames.add(gameForTranslation);
                                successCount[0]++;
                            }
                        } else {
                            synchronized (finalTranslatedGames) {
                                finalTranslatedGames.add(game);
                                successCount[0]++;
                            }
                        }
                        
                    } catch (Exception ex) {
                        log.error("개별 게임 번역 실패: {}", game.get("name"), ex);
                        synchronized (finalTranslatedGames) {
                            finalTranslatedGames.add(game);
                            failureCount[0]++;
                        }
                    }
                });
                
                // 폴백 결과를 translatedGames에 할당
                translatedGames = new ArrayList<>(finalTranslatedGames);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("games", translatedGames);
            result.put("totalGames", games.size());
            result.put("successCount", successCount[0]);
            result.put("failureCount", failureCount[0]);
            result.put("successRate", games.size() > 0 ? (double) successCount[0] / games.size() * 100 : 0);
            
            TrendResponse<Map<String, Object>> response = TrendResponse.success(
                result,
                String.format("전체 게임 번역 완료: %d개 성공, %d개 실패", successCount[0], failureCount[0])
            );
            
            log.info("TOP 30 전체 게임 번역 API 응답 완료: {}개 성공, {}개 실패 (병렬 처리)", 
                successCount[0], failureCount[0]);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("TOP 30 전체 게임 번역 API 오류 발생", e);
            TrendResponse<Map<String, Object>> errorResponse = TrendResponse.<Map<String, Object>>builder()
                    .status("error")
                    .message("전체 게임 번역 중 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .cached(false)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 장르/메카닉 용어 번역 메서드
     * @param terms 번역할 용어 리스트
     * @param type "categories" 또는 "mechanics"
     * @return 번역된 용어 리스트
     */
    private java.util.List<String> translateTerms(java.util.List<String> terms, String type) {
        if (terms == null || terms.isEmpty()) {
            return terms;
        }
        
        try {
            log.info("{}개 {} 번역 시작: {}", terms.size(), type, terms);
            
            // Python 번역 서비스 호출
            if ("categories".equals(type)) {
                // 카테고리 번역 요청
                java.util.List<String> translated = pythonTranslationService.translateCategoriesOnly(terms);
                log.info("카테고리 번역 완료: {} -> {}", terms, translated);
                return translated != null && !translated.isEmpty() ? translated : terms;
                
            } else if ("mechanics".equals(type)) {
                // 메카닉 번역 요청  
                java.util.List<String> translated = pythonTranslationService.translateMechanicsOnly(terms);
                log.info("메카닉 번역 완료: {} -> {}", terms, translated);
                return translated != null && !translated.isEmpty() ? translated : terms;
            }
            
        } catch (Exception e) {
            log.error("{} 번역 중 오류 발생: {}", type, e.getMessage(), e);
        }
        
        // 실패 시 원본 반환
        return terms;
    }
}