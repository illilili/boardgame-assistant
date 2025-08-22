package com.boardgame.backend_spring.trendanalysis.original.service;

import com.boardgame.backend_spring.trendanalysis.original.entity.BoardgameTrend;
import com.boardgame.backend_spring.trendanalysis.original.repository.BoardgameTrendRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 인터랙티브 트렌드 탐색 서비스
 * - 동적 필터링 및 집계 데이터 생성
 * - 버블차트, 히트맵용 데이터 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InteractiveTrendService {
    
    private final BoardgameTrendRepository repository;
    private final ObjectMapper objectMapper;
    
    /**
     * 통합 필터링 - 조건에 맞는 게임 목록 반환 (품질 데이터 우선)
     */
    public List<Map<String, Object>> filterGames(
            Double complexityMin, Double complexityMax, String players, 
            String categories, String mechanics, Integer limit, String sortBy, String sortOrder) {
        
        log.info("게임 필터링 시작: complexity=[{}-{}], players={}, categories={}, mechanics={}, limit={}, sort={}:{}", 
                complexityMin, complexityMax, players, categories, mechanics, limit, sortBy, sortOrder);
        
        // 품질 데이터만 조회 - 평점과 난이도가 있는 게임만
        List<BoardgameTrend> allGames = repository.findAll().stream()
                .filter(this::isQualityGame)
                .collect(Collectors.toList());
        
        // 플레이어 수 파싱
        Set<Integer> playerSet = parseIntegerList(players);
        
        // 카테고리 파싱
        Set<String> categorySet = parseStringList(categories);
        
        // 메카닉 파싱
        Set<String> mechanicSet = parseStringList(mechanics);
        
        // 스트림 필터링 및 정렬
        List<BoardgameTrend> filteredGames = allGames.stream()
                .filter(game -> filterByComplexity(game, complexityMin, complexityMax))
                .filter(game -> filterByPlayers(game, playerSet))
                .filter(game -> filterByCategories(game, categorySet))
                .filter(game -> filterByMechanics(game, mechanicSet))
                .sorted(getGameComparator(sortBy, sortOrder))
                .limit(limit)
                .collect(Collectors.toList());
        
        // DTO 변환
        List<Map<String, Object>> result = filteredGames.stream()
                .map(this::convertToGameMap)
                .collect(Collectors.toList());
        
        log.info("게임 필터링 완료: {}개 결과", result.size());
        return result;
    }
    
    /**
     * 버블 차트용 집계 데이터 생성
     * X축: 평균 평점, Y축: 평균 난이도, 크기: 게임 수
     */
    public List<Map<String, Object>> getBubbleChartData(
            String groupBy, Double complexityMin, Double complexityMax, String players,
            String categories, String mechanics, Integer limit) {
        
        log.info("버블 차트 데이터 생성 시작: groupBy={}, 필터 조건과 동일한 게임 집합 사용", groupBy);
        
        // 동일한 필터 조건으로 게임 조회 (사용자가 보는 게임과 동일)
        List<Map<String, Object>> filteredGames = filterGames(
                complexityMin, complexityMax, players, categories, mechanics, 
                limit != null ? limit : 500, "geek_rating", "desc"
        );
        
        // 그룹별 집계
        Map<String, List<Map<String, Object>>> groupedGames = new HashMap<>();
        
        for (Map<String, Object> game : filteredGames) {
            List<String> groupItems = getGroupItems(game, groupBy);
            
            for (String groupItem : groupItems) {
                groupedGames.computeIfAbsent(groupItem, k -> new ArrayList<>()).add(game);
            }
        }
        
        // 버블 데이터 생성
        List<Map<String, Object>> bubbleData = new ArrayList<>();
        
        for (Map.Entry<String, List<Map<String, Object>>> entry : groupedGames.entrySet()) {
            String groupName = entry.getKey();
            List<Map<String, Object>> groupGames = entry.getValue();
            
            if (groupGames.size() >= 3) { // 최소 3개 게임 이상인 그룹만 포함
                double avgRating = groupGames.stream()
                        .filter(game -> game.get("averageRating") != null)
                        .mapToDouble(game -> ((Number) game.get("averageRating")).doubleValue())
                        .average()
                        .orElse(0.0);
                
                double avgComplexity = groupGames.stream()
                        .filter(game -> game.get("averageWeight") != null)
                        .mapToDouble(game -> ((Number) game.get("averageWeight")).doubleValue())
                        .average()
                        .orElse(0.0);
                
                Map<String, Object> bubblePoint = new HashMap<>();
                bubblePoint.put("group", groupName);
                bubblePoint.put("x", Math.round(avgRating * 100.0) / 100.0);
                bubblePoint.put("y", Math.round(avgComplexity * 100.0) / 100.0);
                bubblePoint.put("size", groupGames.size());
                bubblePoint.put("games", groupGames.stream().limit(5).collect(Collectors.toList())); // 샘플 게임 5개
                
                bubbleData.add(bubblePoint);
            }
        }
        
        // 크기 순으로 정렬 (큰 것부터)
        bubbleData.sort((a, b) -> Integer.compare((Integer) b.get("size"), (Integer) a.get("size")));
        
        log.info("버블 차트 데이터 생성 완료: {}개 그룹", bubbleData.size());
        return bubbleData;
    }
    
    /**
     * 히트맵용 집계 데이터 생성
     * X축: 플레이어 수, Y축: 난이도 구간, 값: 게임 수
     */
    public List<Map<String, Object>> getHeatmapData(
            Double complexityMin, Double complexityMax, String players,
            String categories, String mechanics, Integer limit) {
        log.info("히트맵 데이터 생성 시작: 필터 조건과 동일한 게임 집합 사용");
        
        // 동일한 필터 조건으로 게임 조회 (사용자가 보는 게임과 동일)
        List<Map<String, Object>> filteredGames = filterGames(
                complexityMin != null ? complexityMin : 1.0,
                complexityMax != null ? complexityMax : 5.0,
                players, categories, mechanics,
                limit != null ? limit : 500, "geek_rating", "desc"
        );
        
        // 플레이어 수 범위 정의
        List<String> playerRanges = Arrays.asList("1인", "2인", "3-4인", "5-6인", "7인+");
        
        // 난이도 범위 정의
        List<String> complexityRanges = Arrays.asList("초급 (1.0-2.0)", "중급 (2.0-3.0)", "상급 (3.0-4.0)", "전문가 (4.0+)");
        
        // 히트맵 데이터 생성
        List<Map<String, Object>> heatmapData = new ArrayList<>();
        
        for (String playerRange : playerRanges) {
            for (String complexityRange : complexityRanges) {
                long gameCount = filteredGames.stream()
                        .filter(game -> matchesPlayerRange(game, playerRange))
                        .filter(game -> matchesComplexityRange(game, complexityRange))
                        .count();
                
                Map<String, Object> heatmapCell = new HashMap<>();
                heatmapCell.put("x", playerRange);
                heatmapCell.put("y", complexityRange);
                heatmapCell.put("value", gameCount);
                heatmapCell.put("percentage", filteredGames.size() > 0 ? 
                    Math.round((gameCount * 100.0 / filteredGames.size()) * 10.0) / 10.0 : 0.0);
                
                heatmapData.add(heatmapCell);
            }
        }
        
        log.info("히트맵 데이터 생성 완료: {}개 셀", heatmapData.size());
        return heatmapData;
    }
    
    /**
     * 모든 카테고리 목록 조회 (캐시 적용)
     */
    @Cacheable(value = "allCategories", key = "'all_categories'")
    public List<String> getAllCategories() {
        log.info("전체 카테고리 목록 조회 시작");
        
        List<BoardgameTrend> allGames = repository.findAll();
        Set<String> allCategories = new HashSet<>();
        
        for (BoardgameTrend game : allGames) {
            if (game.getCategories() != null && !game.getCategories().trim().isEmpty()) {
                try {
                    List<String> categories = objectMapper.readValue(
                        game.getCategories(), new TypeReference<List<String>>() {}
                    );
                    allCategories.addAll(categories);
                } catch (Exception e) {
                    log.debug("카테고리 파싱 실패: gameId={}", game.getId());
                }
            }
        }
        
        List<String> result = allCategories.stream()
                .filter(cat -> cat != null && !cat.trim().isEmpty())
                .sorted()
                .collect(Collectors.toList());
        
        log.info("전체 카테고리 목록 조회 완료: {}개", result.size());
        return result;
    }
    
    /**
     * 인기 카테고리 목록 조회 (게임 수 기준 상위 25개)
     */
    @Cacheable(value = "popularCategories", key = "'popular_categories'")
    public List<String> getPopularCategories() {
        log.info("인기 카테고리 목록 조회 시작");
        
        List<BoardgameTrend> qualityGames = repository.findAll().stream()
                .filter(this::isQualityGame)
                .collect(Collectors.toList());
        
        Map<String, Long> categoryCount = new HashMap<>();
        
        for (BoardgameTrend game : qualityGames) {
            if (game.getCategories() != null && !game.getCategories().trim().isEmpty()) {
                try {
                    List<String> categories = objectMapper.readValue(
                        game.getCategories(), new TypeReference<List<String>>() {}
                    );
                    
                    for (String category : categories) {
                        if (category != null && !category.trim().isEmpty()) {
                            categoryCount.merge(category, 1L, Long::sum);
                        }
                    }
                } catch (Exception e) {
                    log.debug("카테고리 파싱 실패: gameId={}", game.getId());
                }
            }
        }
        
        List<String> result = categoryCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(25) // 상위 25개만
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        log.info("인기 카테고리 목록 조회 완료: {}개 (전체 {}개 중)", result.size(), categoryCount.size());
        return result;
    }
    
    /**
     * 모든 메카닉 목록 조회 (캐시 적용)
     */
    @Cacheable(value = "allMechanics", key = "'all_mechanics'")
    public List<String> getAllMechanics() {
        log.info("전체 메카닉 목록 조회 시작");
        
        List<BoardgameTrend> allGames = repository.findAll();
        Set<String> allMechanics = new HashSet<>();
        
        for (BoardgameTrend game : allGames) {
            if (game.getMechanics() != null && !game.getMechanics().trim().isEmpty()) {
                try {
                    List<String> mechanics = objectMapper.readValue(
                        game.getMechanics(), new TypeReference<List<String>>() {}
                    );
                    allMechanics.addAll(mechanics);
                } catch (Exception e) {
                    log.debug("메카닉 파싱 실패: gameId={}", game.getId());
                }
            }
        }
        
        List<String> result = allMechanics.stream()
                .filter(mech -> mech != null && !mech.trim().isEmpty())
                .sorted()
                .collect(Collectors.toList());
        
        log.info("전체 메카닉 목록 조회 완료: {}개", result.size());
        return result;
    }
    
    /**
     * 인기 메카닉 목록 조회 (게임 수 기준 상위 30개)
     */
    @Cacheable(value = "popularMechanics", key = "'popular_mechanics'")
    public List<String> getPopularMechanics() {
        log.info("인기 메카닉 목록 조회 시작");
        
        List<BoardgameTrend> qualityGames = repository.findAll().stream()
                .filter(this::isQualityGame)
                .collect(Collectors.toList());
        
        Map<String, Long> mechanicCount = new HashMap<>();
        
        for (BoardgameTrend game : qualityGames) {
            if (game.getMechanics() != null && !game.getMechanics().trim().isEmpty()) {
                try {
                    List<String> mechanics = objectMapper.readValue(
                        game.getMechanics(), new TypeReference<List<String>>() {}
                    );
                    
                    for (String mechanic : mechanics) {
                        if (mechanic != null && !mechanic.trim().isEmpty()) {
                            mechanicCount.merge(mechanic, 1L, Long::sum);
                        }
                    }
                } catch (Exception e) {
                    log.debug("메카닉 파싱 실패: gameId={}", game.getId());
                }
            }
        }
        
        List<String> result = mechanicCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(30) // 상위 30개만
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        log.info("인기 메카닉 목록 조회 완료: {}개 (전체 {}개 중)", result.size(), mechanicCount.size());
        return result;
    }
    
    /**
     * 헬스체크
     */
    public Map<String, Object> getHealthStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            long totalGames = repository.count();
            long categoriesCount = getAllCategories().size();
            long mechanicsCount = getAllMechanics().size();
            
            status.put("status", "healthy");
            status.put("service", "interactive_trend");
            status.put("totalGames", totalGames);
            status.put("totalCategories", categoriesCount);
            status.put("totalMechanics", mechanicsCount);
            status.put("timestamp", new Date());
            
        } catch (Exception e) {
            status.put("status", "unhealthy");
            status.put("error", e.getMessage());
            log.error("인터랙티브 트렌드 헬스체크 실패", e);
        }
        
        return status;
    }
    
    // === 품질 데이터 필터링 유틸리티 메서드들 ===
    
    /**
     * 품질 게임 판별 (평점과 난이도가 있는 게임만)
     */
    private boolean isQualityGame(BoardgameTrend game) {
        return game.getAverageRating() != null && game.getAverageRating().doubleValue() > 0.0
            && game.getAverageWeight() != null && game.getAverageWeight().doubleValue() > 0.0
            && game.getName() != null && !game.getName().trim().isEmpty()
            && game.getMinPlayers() != null && game.getMaxPlayers() != null;
    }
    
    /**
     * 게임 정렬 Comparator 생성
     */
    private Comparator<BoardgameTrend> getGameComparator(String sortBy, String sortOrder) {
        Comparator<BoardgameTrend> comparator;
        
        switch (sortBy.toLowerCase()) {
            case "geek_rating":
                comparator = Comparator.comparing(
                    game -> game.getGeekRating() != null ? game.getGeekRating().doubleValue() : 0.0,
                    Comparator.reverseOrder() // 평점은 높은 순이 기본
                );
                break;
            case "average_rating":
                comparator = Comparator.comparing(
                    game -> game.getAverageRating() != null ? game.getAverageRating().doubleValue() : 0.0,
                    Comparator.reverseOrder()
                );
                break;
            case "average_weight":
                comparator = Comparator.comparing(
                    game -> game.getAverageWeight() != null ? game.getAverageWeight().doubleValue() : 0.0
                );
                break;
            case "year_published":
                comparator = Comparator.comparing(
                    game -> game.getYearPublished() != null ? game.getYearPublished() : 0,
                    Comparator.reverseOrder() // 최신 순이 기본
                );
                break;
            case "name":
                comparator = Comparator.comparing(
                    game -> game.getName() != null ? game.getName() : ""
                );
                break;
            default:
                // 기본값: 평점 높은 순
                comparator = Comparator.comparing(
                    game -> game.getGeekRating() != null ? game.getGeekRating().doubleValue() : 0.0,
                    Comparator.reverseOrder()
                );
        }
        
        // 정렬 순서 적용
        if ("asc".equalsIgnoreCase(sortOrder) && 
            ("geek_rating".equals(sortBy) || "average_rating".equals(sortBy) || "year_published".equals(sortBy))) {
            comparator = comparator.reversed();
        } else if ("desc".equalsIgnoreCase(sortOrder) && 
                  ("average_weight".equals(sortBy) || "name".equals(sortBy))) {
            comparator = comparator.reversed();
        }
        
        return comparator;
    }
    
    // === 기존 유틸리티 메서드들 ===
    
    private Set<Integer> parseIntegerList(String input) {
        if (input == null || input.trim().isEmpty()) {
            return Collections.emptySet();
        }
        
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(Collectors.toSet());
    }
    
    private Set<String> parseStringList(String input) {
        if (input == null || input.trim().isEmpty()) {
            return Collections.emptySet();
        }
        
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }
    
    private boolean filterByComplexity(BoardgameTrend game, Double min, Double max) {
        if (game.getAverageWeight() == null) return false;
        double complexity = game.getAverageWeight().doubleValue();
        return complexity >= min && complexity <= max;
    }
    
    private boolean filterByPlayers(BoardgameTrend game, Set<Integer> playerSet) {
        if (playerSet.isEmpty()) return true;
        if (game.getMinPlayers() == null || game.getMaxPlayers() == null) return false;
        
        int minPlayers = game.getMinPlayers();
        int maxPlayers = game.getMaxPlayers();
        
        return playerSet.stream().anyMatch(players -> players >= minPlayers && players <= maxPlayers);
    }
    
    private boolean filterByCategories(BoardgameTrend game, Set<String> categorySet) {
        if (categorySet.isEmpty()) return true;
        if (game.getCategories() == null || game.getCategories().trim().isEmpty()) return false;
        
        try {
            List<String> gameCategories = objectMapper.readValue(
                game.getCategories(), new TypeReference<List<String>>() {}
            );
            
            return gameCategories.stream().anyMatch(categorySet::contains);
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean filterByMechanics(BoardgameTrend game, Set<String> mechanicSet) {
        if (mechanicSet.isEmpty()) return true;
        if (game.getMechanics() == null || game.getMechanics().trim().isEmpty()) return false;
        
        try {
            List<String> gameMechanics = objectMapper.readValue(
                game.getMechanics(), new TypeReference<List<String>>() {}
            );
            
            return gameMechanics.stream().anyMatch(mechanicSet::contains);
        } catch (Exception e) {
            return false;
        }
    }
    
    private Map<String, Object> convertToGameMap(BoardgameTrend game) {
        Map<String, Object> gameMap = new HashMap<>();
        
        gameMap.put("id", game.getId());
        gameMap.put("gameId", game.getGameId());
        gameMap.put("name", game.getName());
        gameMap.put("averageRating", game.getAverageRating() != null ? game.getAverageRating().doubleValue() : null);
        gameMap.put("averageWeight", game.getAverageWeight() != null ? game.getAverageWeight().doubleValue() : null);
        gameMap.put("minPlayers", game.getMinPlayers());
        gameMap.put("maxPlayers", game.getMaxPlayers());
        gameMap.put("yearPublished", game.getYearPublished());
        gameMap.put("playingTime", game.getPlayingTime());
        
        // 카테고리 파싱
        if (game.getCategories() != null && !game.getCategories().trim().isEmpty()) {
            try {
                List<String> categories = objectMapper.readValue(
                    game.getCategories(), new TypeReference<List<String>>() {}
                );
                gameMap.put("categories", categories);
            } catch (Exception e) {
                gameMap.put("categories", Collections.emptyList());
            }
        } else {
            gameMap.put("categories", Collections.emptyList());
        }
        
        // 메카닉 파싱
        if (game.getMechanics() != null && !game.getMechanics().trim().isEmpty()) {
            try {
                List<String> mechanics = objectMapper.readValue(
                    game.getMechanics(), new TypeReference<List<String>>() {}
                );
                gameMap.put("mechanics", mechanics);
            } catch (Exception e) {
                gameMap.put("mechanics", Collections.emptyList());
            }
        } else {
            gameMap.put("mechanics", Collections.emptyList());
        }
        
        return gameMap;
    }
    
    @SuppressWarnings("unchecked")
    private List<String> getGroupItems(Map<String, Object> game, String groupBy) {
        if ("categories".equals(groupBy)) {
            return (List<String>) game.getOrDefault("categories", Collections.emptyList());
        } else if ("mechanics".equals(groupBy)) {
            return (List<String>) game.getOrDefault("mechanics", Collections.emptyList());
        }
        return Collections.emptyList();
    }
    
    private boolean matchesPlayerRange(Map<String, Object> game, String playerRange) {
        Integer minPlayers = (Integer) game.get("minPlayers");
        Integer maxPlayers = (Integer) game.get("maxPlayers");
        
        if (minPlayers == null || maxPlayers == null) return false;
        
        switch (playerRange) {
            case "1인": return minPlayers <= 1 && maxPlayers >= 1;
            case "2인": return minPlayers <= 2 && maxPlayers >= 2;
            case "3-4인": return (minPlayers <= 3 && maxPlayers >= 3) || (minPlayers <= 4 && maxPlayers >= 4);
            case "5-6인": return (minPlayers <= 5 && maxPlayers >= 5) || (minPlayers <= 6 && maxPlayers >= 6);
            case "7인+": return maxPlayers >= 7;
            default: return false;
        }
    }
    
    private boolean matchesComplexityRange(Map<String, Object> game, String complexityRange) {
        Double complexity = (Double) game.get("averageWeight");
        if (complexity == null) return false;
        
        switch (complexityRange) {
            case "초급 (1.0-2.0)": return complexity >= 1.0 && complexity < 2.0;
            case "중급 (2.0-3.0)": return complexity >= 2.0 && complexity < 3.0;
            case "상급 (3.0-4.0)": return complexity >= 3.0 && complexity < 4.0;
            case "전문가 (4.0+)": return complexity >= 4.0;
            default: return false;
        }
    }
}