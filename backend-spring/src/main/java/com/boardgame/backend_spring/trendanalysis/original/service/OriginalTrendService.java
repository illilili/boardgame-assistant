package com.boardgame.backend_spring.trendanalysis.original.service;

import com.boardgame.backend_spring.trendanalysis.original.dto.ThemeStatistic;
import com.boardgame.backend_spring.trendanalysis.original.dto.MechanismStatistic;
import com.boardgame.backend_spring.trendanalysis.original.dto.DifficultyDistribution;
import com.boardgame.backend_spring.trendanalysis.original.dto.PlayerCountDistribution;
import com.boardgame.backend_spring.trendanalysis.original.entity.BoardgameTrend;
import com.boardgame.backend_spring.trendanalysis.original.repository.BoardgameTrendRepository;
import org.springframework.data.domain.PageRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 10,000개 데이터셋 기반 기존 보드게임 트렌드 분석 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OriginalTrendService {
    
    private final BoardgameTrendRepository repository;
    private final ObjectMapper objectMapper;
    
    /**
     * 인기 테마 상위 10개 조회
     */
    @Cacheable(value = "popularThemes", key = "'themes_top_10'")
    public List<ThemeStatistic> getPopularThemes() {
        log.info("기존 데이터셋 - 인기 테마 데이터 조회 시작");
        
        List<BoardgameTrend> allGames = repository.findAll();
        Map<String, Long> themeCountMap = new HashMap<>();
        
        // 모든 게임의 카테고리를 파싱해서 카운트
        for (BoardgameTrend game : allGames) {
            if (game.getCategories() != null && !game.getCategories().trim().isEmpty()) {
                try {
                    List<String> categories = objectMapper.readValue(
                        game.getCategories(), new TypeReference<List<String>>() {}
                    );
                    
                    for (String category : categories) {
                        if (category != null && !category.trim().isEmpty()) {
                            themeCountMap.put(category.trim(), 
                                themeCountMap.getOrDefault(category.trim(), 0L) + 1);
                        }
                    }
                    
                } catch (Exception e) {
                    log.debug("카테고리 파싱 실패: gameId={}, categories={}", 
                        game.getId(), game.getCategories());
                }
            }
        }
        
        // 상위 15개 테마 선별 및 평균값 계산
        List<ThemeStatistic> popularThemes = themeCountMap.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(15)
            .map(entry -> {
                String theme = entry.getKey();
                Long count = entry.getValue();
                double percentage = (count * 100.0) / allGames.size();
                
                // 해당 테마를 가진 게임들의 평균 평점과 평균 난이도 계산
                Map<String, Double> averages = calculateThemeAverages(allGames, theme);
                
                return new ThemeStatistic(
                    theme,
                    count,
                    BigDecimal.valueOf(percentage).setScale(2, RoundingMode.HALF_UP).doubleValue(),
                    averages.get("avgRating"),
                    averages.get("avgComplexity")
                );
            })
            .collect(Collectors.toList());
        
        log.info("기존 데이터셋 - 인기 테마 데이터 조회 완료: {} 개", popularThemes.size());
        return popularThemes;
    }
    
    /**
     * 인기 메커니즘 상위 10개 조회
     */
    @Cacheable(value = "popularMechanisms", key = "'mechanisms_top_10'")
    public List<MechanismStatistic> getPopularMechanisms() {
        log.info("기존 데이터셋 - 인기 메커니즘 데이터 조회 시작");
        
        List<BoardgameTrend> allGames = repository.findAll();
        Map<String, Long> mechanismCountMap = new HashMap<>();
        
        // 모든 게임의 메커니즘을 파싱해서 카운트
        for (BoardgameTrend game : allGames) {
            if (game.getMechanics() != null && !game.getMechanics().trim().isEmpty()) {
                try {
                    List<String> mechanics = objectMapper.readValue(
                        game.getMechanics(), new TypeReference<List<String>>() {}
                    );
                    
                    for (String mechanic : mechanics) {
                        if (mechanic != null && !mechanic.trim().isEmpty()) {
                            mechanismCountMap.put(mechanic.trim(), 
                                mechanismCountMap.getOrDefault(mechanic.trim(), 0L) + 1);
                        }
                    }
                    
                } catch (Exception e) {
                    log.debug("메커니즘 파싱 실패: gameId={}, mechanics={}", 
                        game.getId(), game.getMechanics());
                }
            }
        }
        
        // 상위 15개 메커니즘 선별 및 평균값 계산
        List<MechanismStatistic> popularMechanisms = mechanismCountMap.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(15)
            .map(entry -> {
                String mechanism = entry.getKey();
                Long count = entry.getValue();
                double percentage = (count * 100.0) / allGames.size();
                
                // 해당 메커니즘을 가진 게임들의 평균 평점과 평균 난이도 계산
                Map<String, Double> averages = calculateMechanismAverages(allGames, mechanism);
                
                return new MechanismStatistic(
                    mechanism,
                    count,
                    BigDecimal.valueOf(percentage).setScale(2, RoundingMode.HALF_UP).doubleValue(),
                    averages.get("avgRating"),
                    averages.get("avgComplexity")
                );
            })
            .collect(Collectors.toList());
        
        log.info("기존 데이터셋 - 인기 메커니즘 데이터 조회 완료: {} 개", popularMechanisms.size());
        return popularMechanisms;
    }
    
    /**
     * 난이도 분포 조회
     */
    @Cacheable(value = "difficultyDistribution", key = "'difficulty_distribution'")
    public List<DifficultyDistribution> getDifficultyDistribution() {
        log.info("기존 데이터셋 - 난이도 분포 데이터 조회 시작");
        
        List<Object[]> rawData = repository.getDifficultyDistribution();
        List<DifficultyDistribution> distribution = new ArrayList<>();
        
        for (Object[] row : rawData) {
            String level = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            Double percentage = ((Number) row[2]).doubleValue();
            Double averageWeight = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
            
            DifficultyDistribution difficultyDist = new DifficultyDistribution();
            difficultyDist.setLevel(level);
            difficultyDist.setCount(count);
            difficultyDist.setPercentage(BigDecimal.valueOf(percentage)
                .setScale(2, RoundingMode.HALF_UP).doubleValue());
            difficultyDist.setAverageWeight(BigDecimal.valueOf(averageWeight)
                .setScale(2, RoundingMode.HALF_UP).doubleValue());
            difficultyDist.setDescription(getDifficultyDescription(level));
            
            distribution.add(difficultyDist);
        }
        
        log.info("기존 데이터셋 - 난이도 분포 데이터 조회 완료: {} 개 구간", distribution.size());
        return distribution;
    }
    
    /**
     * 플레이어 수 분포 조회
     */
    @Cacheable(value = "playerCountDistribution", key = "'player_count_distribution'")
    public List<PlayerCountDistribution> getPlayerCountDistribution() {
        log.info("기존 데이터셋 - 플레이어 수 분포 데이터 조회 시작");
        
        List<Object[]> rawData = repository.getPlayerCountDistribution();
        List<PlayerCountDistribution> distribution = new ArrayList<>();
        
        for (Object[] row : rawData) {
            String range = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            Double percentage = ((Number) row[2]).doubleValue();
            
            PlayerCountDistribution playerDist = new PlayerCountDistribution();
            playerDist.setPlayerRange(range);
            playerDist.setCount(count);
            playerDist.setPercentage(BigDecimal.valueOf(percentage)
                .setScale(2, RoundingMode.HALF_UP).doubleValue());
            playerDist.setDescription(getPlayerCountDescription(range));
            
            distribution.add(playerDist);
        }
        
        log.info("기존 데이터셋 - 플레이어 수 분포 데이터 조회 완료: {} 개 구간", distribution.size());
        return distribution;
    }
    
    /**
     * 헬스체크
     */
    public Map<String, Object> getHealthStatus() {
        try {
            Long totalGames = repository.getTotalGameCount();
            
            Map<String, Object> healthStatus = new HashMap<>();
            healthStatus.put("status", "healthy");
            healthStatus.put("totalGames", totalGames);
            healthStatus.put("dataSource", "boardgame_trends");
            healthStatus.put("lastChecked", new Date());
            
            log.info("기존 데이터셋 - 헬스체크 성공: 총 {}개 게임", totalGames);
            return healthStatus;
            
        } catch (Exception e) {
            log.error("기존 데이터셋 - 헬스체크 실패", e);
            
            Map<String, Object> healthStatus = new HashMap<>();
            healthStatus.put("status", "unhealthy");
            healthStatus.put("error", e.getMessage());
            healthStatus.put("lastChecked", new Date());
            return healthStatus;
        }
    }
    
    /**
     * 난이도 설명 생성
     */
    private String getDifficultyDescription(String level) {
        switch (level.toLowerCase()) {
            case "very light":
                return "매우 쉬움 (1.0-1.5): 누구나 쉽게 즐길 수 있는 게임";
            case "light":
                return "쉬움 (1.5-2.0): 간단한 규칙으로 접근하기 용이한 게임";
            case "medium light":
                return "보통-쉬움 (2.0-2.5): 약간의 전략이 필요한 게임";
            case "medium":
                return "보통 (2.5-3.0): 균형 잡힌 전략과 운이 요구되는 게임";
            case "medium heavy":
                return "어려움 (3.0-3.5): 깊은 사고와 전략이 필요한 게임";
            case "heavy":
                return "매우 어려움 (3.5-4.0): 복잡한 규칙과 고도의 전략이 필요한 게임";
            case "very heavy":
                return "극도로 어려움 (4.0+): 전문가 수준의 게임";
            default:
                return "정보 없음";
        }
    }
    
    /**
     * 플레이어 수 설명 생성
     */
    private String getPlayerCountDescription(String range) {
        switch (range) {
            case "1":
                return "솔로 게임: 혼자서 즐기는 게임";
            case "2":
                return "2인 게임: 커플이나 친구와 즐기는 게임";
            case "3-4":
                return "소규모 그룹: 가족이나 소규모 친구들과 즐기는 게임";
            case "5-6":
                return "중규모 그룹: 파티나 모임에서 즐기는 게임";
            case "7+":
                return "대규모 그룹: 큰 파티나 단체 활동용 게임";
            default:
                return "다양한 인원수 지원";
        }
    }
    
    /**
     * 평점 분포 조회
     */
    @Cacheable(value = "ratingDistribution", key = "'rating_distribution'")
    public List<Map<String, Object>> getRatingDistribution() {
        log.info("기존 데이터셋 - 평점 분포 데이터 조회 시작");
        
        List<Object[]> rawData = repository.getRatingDistribution();
        List<Map<String, Object>> distribution = new ArrayList<>();
        
        for (Object[] row : rawData) {
            String ratingRange = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            Double percentage = ((Number) row[2]).doubleValue();
            
            Map<String, Object> ratingDist = new HashMap<>();
            ratingDist.put("ratingRange", ratingRange);
            ratingDist.put("count", count);
            ratingDist.put("percentage", BigDecimal.valueOf(percentage).setScale(2, RoundingMode.HALF_UP).doubleValue());
            ratingDist.put("description", getRatingDescription(ratingRange));
            
            distribution.add(ratingDist);
        }
        
        log.info("기존 데이터셋 - 평점 분포 데이터 조회 완료: {} 개 구간", distribution.size());
        return distribution;
    }
    
    /**
     * 연도별 게임 출시 수 조회 (최근 10년)
     */
    @Cacheable(value = "yearlyDistribution", key = "'yearly_distribution'")
    public List<Map<String, Object>> getYearlyGameDistribution() {
        log.info("기존 데이터셋 - 연도별 게임 분포 데이터 조회 시작");
        
        int startYear = 2014; // 최근 10년
        List<Object[]> rawData = repository.getGameCountByYear(startYear);
        List<Map<String, Object>> distribution = new ArrayList<>();
        
        for (Object[] row : rawData) {
            Integer year = (Integer) row[0];
            Long count = ((Number) row[1]).longValue();
            
            Map<String, Object> yearDist = new HashMap<>();
            yearDist.put("year", year);
            yearDist.put("count", count);
            
            distribution.add(yearDist);
        }
        
        log.info("기존 데이터셋 - 연도별 게임 분포 데이터 조회 완료: {} 개 연도", distribution.size());
        return distribution;
    }
    
    /**
     * 상위 평점 게임들 조회
     */
    @Cacheable(value = "topRatedGames", key = "#limit")
    public List<Map<String, Object>> getTopRatedGames(int limit) {
        log.info("기존 데이터셋 - 상위 평점 게임 {} 개 조회 시작", limit);
        
        List<BoardgameTrend> games = repository.findTopRatedGames(PageRequest.of(0, limit));
        List<Map<String, Object>> topGames = new ArrayList<>();
        
        for (BoardgameTrend game : games) {
            Map<String, Object> gameInfo = new HashMap<>();
            gameInfo.put("gameId", game.getGameId());
            gameInfo.put("name", game.getName());
            gameInfo.put("geekRating", game.getGeekRating());
            gameInfo.put("averageRating", game.getAverageRating());
            gameInfo.put("yearPublished", game.getYearPublished());
            gameInfo.put("minPlayers", game.getMinPlayers());
            gameInfo.put("maxPlayers", game.getMaxPlayers());
            gameInfo.put("averageWeight", game.getAverageWeight());
            
            // 카테고리 파싱
            if (game.getCategories() != null && !game.getCategories().trim().isEmpty()) {
                try {
                    List<String> categories = objectMapper.readValue(
                        game.getCategories(), new TypeReference<List<String>>() {}
                    );
                    gameInfo.put("categories", categories);
                } catch (Exception e) {
                    gameInfo.put("categories", new ArrayList<String>());
                }
            }
            
            topGames.add(gameInfo);
        }
        
        log.info("기존 데이터셋 - 상위 평점 게임 조회 완료: {} 개", topGames.size());
        return topGames;
    }
    
    /**
     * 대시보드 요약 통계
     */
    @Cacheable(value = "dashboardSummary", key = "'summary'")
    public Map<String, Object> getDashboardSummary() {
        log.info("기존 데이터셋 - 대시보드 요약 통계 조회 시작");
        
        Long totalGames = repository.getTotalGameCount();
        List<BoardgameTrend> top3Games = repository.findTop3ByOrderByGeekRatingDesc();
        
        // 기본 통계
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalGames", totalGames);
        summary.put("topRatedGames", top3Games.size());
        
        // 플레이어 수별 통계
        Long soloGames = repository.countByMinPlayersAndMaxPlayers(1, 1);
        Long twoPlayerGames = repository.countByMinPlayersAndMaxPlayers(2, 2);
        Long partyGames = repository.countByMinPlayersGreaterThan(4);
        
        summary.put("soloGames", soloGames);
        summary.put("twoPlayerGames", twoPlayerGames);
        summary.put("partyGames", partyGames);
        
        // 난이도별 통계
        Long lightGames = repository.countByAverageWeightLessThan(BigDecimal.valueOf(2.5));
        summary.put("lightGames", lightGames);
        
        // 상위 3개 게임 정보
        List<Map<String, Object>> top3Info = new ArrayList<>();
        for (BoardgameTrend game : top3Games) {
            Map<String, Object> gameInfo = new HashMap<>();
            gameInfo.put("name", game.getName());
            gameInfo.put("geekRating", game.getGeekRating());
            gameInfo.put("yearPublished", game.getYearPublished());
            top3Info.add(gameInfo);
        }
        summary.put("top3GamesInfo", top3Info);
        
        log.info("기존 데이터셋 - 대시보드 요약 통계 조회 완료");
        return summary;
    }
    
    /**
     * 테마별 평균 평점과 평균 난이도 계산
     */
    private Map<String, Double> calculateThemeAverages(List<BoardgameTrend> allGames, String targetTheme) {
        List<BoardgameTrend> themeGames = allGames.stream()
            .filter(game -> {
                if (game.getCategories() == null || game.getCategories().trim().isEmpty()) {
                    return false;
                }
                try {
                    List<String> categories = objectMapper.readValue(
                        game.getCategories(), new TypeReference<List<String>>() {}
                    );
                    return categories.contains(targetTheme);
                } catch (Exception e) {
                    return false;
                }
            })
            .collect(Collectors.toList());
        
        if (themeGames.isEmpty()) {
            return Map.of("avgRating", 0.0, "avgComplexity", 0.0);
        }
        
        double avgRating = themeGames.stream()
            .filter(game -> game.getAverageRating() != null)
            .mapToDouble(game -> game.getAverageRating().doubleValue())
            .average()
            .orElse(0.0);
            
        double avgComplexity = themeGames.stream()
            .filter(game -> game.getAverageWeight() != null)
            .mapToDouble(game -> game.getAverageWeight().doubleValue())
            .average()
            .orElse(0.0);
        
        return Map.of(
            "avgRating", BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP).doubleValue(),
            "avgComplexity", BigDecimal.valueOf(avgComplexity).setScale(2, RoundingMode.HALF_UP).doubleValue()
        );
    }
    
    /**
     * 메커니즘별 평균 평점과 평균 난이도 계산
     */
    private Map<String, Double> calculateMechanismAverages(List<BoardgameTrend> allGames, String targetMechanism) {
        List<BoardgameTrend> mechanismGames = allGames.stream()
            .filter(game -> {
                if (game.getMechanics() == null || game.getMechanics().trim().isEmpty()) {
                    return false;
                }
                try {
                    List<String> mechanics = objectMapper.readValue(
                        game.getMechanics(), new TypeReference<List<String>>() {}
                    );
                    return mechanics.contains(targetMechanism);
                } catch (Exception e) {
                    return false;
                }
            })
            .collect(Collectors.toList());
        
        if (mechanismGames.isEmpty()) {
            return Map.of("avgRating", 0.0, "avgComplexity", 0.0);
        }
        
        double avgRating = mechanismGames.stream()
            .filter(game -> game.getAverageRating() != null)
            .mapToDouble(game -> game.getAverageRating().doubleValue())
            .average()
            .orElse(0.0);
            
        double avgComplexity = mechanismGames.stream()
            .filter(game -> game.getAverageWeight() != null)
            .mapToDouble(game -> game.getAverageWeight().doubleValue())
            .average()
            .orElse(0.0);
        
        return Map.of(
            "avgRating", BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP).doubleValue(),
            "avgComplexity", BigDecimal.valueOf(avgComplexity).setScale(2, RoundingMode.HALF_UP).doubleValue()
        );
    }

    /**
     * 평점 범위 설명 생성
     */
    private String getRatingDescription(String ratingRange) {
        switch (ratingRange) {
            case "8.0+":
                return "최고 등급 (8.0+): 보드게임 역사상 명작";
            case "7.5-7.9":
                return "우수 등급 (7.5-7.9): 매우 높은 평가를 받는 게임";
            case "7.0-7.4":
                return "양호 등급 (7.0-7.4): 좋은 평가를 받는 게임";
            case "6.5-6.9":
                return "보통 등급 (6.5-6.9): 평균 이상의 게임";
            case "6.0-6.4":
                return "준수 등급 (6.0-6.4): 평균적인 게임";
            case "~5.9":
                return "하위 등급 (~5.9): 평균 이하의 게임";
            default:
                return "정보 없음";
        }
    }
}