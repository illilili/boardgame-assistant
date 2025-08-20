package com.boardgame.backend_spring.trendanalysis.original.repository;

import com.boardgame.backend_spring.trendanalysis.original.entity.BoardgameTrend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BoardgameTrendRepository extends JpaRepository<BoardgameTrend, Long> {
    
    /**
     * 난이도 분포 조회 (average_weight 기준)
     */
    @Query(value = """
        SELECT 
            difficulty_level,
            COUNT(*) as game_count,
            ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM boardgame_trends WHERE average_weight IS NOT NULL)), 2) as percentage,
            AVG(average_weight) as avg_weight
        FROM (
            SELECT 
                CASE 
                    WHEN average_weight <= 1.5 THEN 'Very Light'
                    WHEN average_weight <= 2.0 THEN 'Light'
                    WHEN average_weight <= 2.5 THEN 'Medium Light'
                    WHEN average_weight <= 3.0 THEN 'Medium'
                    WHEN average_weight <= 3.5 THEN 'Medium Heavy'
                    WHEN average_weight <= 4.0 THEN 'Heavy'
                    ELSE 'Very Heavy'
                END as difficulty_level,
                average_weight
            FROM boardgame_trends 
            WHERE average_weight IS NOT NULL
        ) t
        GROUP BY difficulty_level
        ORDER BY MIN(average_weight) ASC
        """, nativeQuery = true)
    List<Object[]> getDifficultyDistribution();
    
    /**
     * 플레이어 수 분포 조회
     */
    @Query(value = """
        SELECT 
            player_range,
            COUNT(*) as game_count,
            ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM boardgame_trends WHERE min_players IS NOT NULL AND max_players IS NOT NULL)), 2) as percentage
        FROM (
            SELECT 
                CASE 
                    WHEN max_players = 1 THEN '1'
                    WHEN max_players = 2 THEN '2'
                    WHEN max_players <= 4 THEN '3-4'
                    WHEN max_players <= 6 THEN '5-6'
                    ELSE '7+'
                END as player_range
            FROM boardgame_trends 
            WHERE min_players IS NOT NULL AND max_players IS NOT NULL
        ) t
        GROUP BY player_range
        ORDER BY 
            CASE 
                WHEN player_range = '1' THEN 1
                WHEN player_range = '2' THEN 2
                WHEN player_range = '3-4' THEN 3
                WHEN player_range = '5-6' THEN 4
                WHEN player_range = '7+' THEN 5
            END
        """, nativeQuery = true)
    List<Object[]> getPlayerCountDistribution();
    
    /**
     * 총 게임 수 조회
     */
    @Query("SELECT COUNT(bt) FROM BoardgameTrend bt")
    Long getTotalGameCount();
    
    /**
     * 평점이 높은 게임들 조회 (상위 N개)
     */
    @Query("SELECT bt FROM BoardgameTrend bt WHERE bt.geekRating IS NOT NULL ORDER BY bt.geekRating DESC")
    List<BoardgameTrend> getTopRatedGames();
    
    /**
     * 특정 난이도 범위의 게임 수 조회
     */
    @Query("SELECT COUNT(bt) FROM BoardgameTrend bt WHERE bt.averageWeight BETWEEN :minWeight AND :maxWeight")
    Long getGameCountByWeightRange(BigDecimal minWeight, BigDecimal maxWeight);
    
    /**
     * 특정 플레이어 수 범위의 게임 수 조회
     */
    @Query("SELECT COUNT(bt) FROM BoardgameTrend bt WHERE bt.minPlayers <= :playerCount AND bt.maxPlayers >= :playerCount")
    Long getGameCountByPlayerCount(Integer playerCount);
    
    /**
     * 최근 게임 5개 조회 (ID 순)
     */
    List<BoardgameTrend> findTop5ByOrderByIdDesc();
    
    /**
     * 인기 게임 3개 조회 (평점 순)
     */
    List<BoardgameTrend> findTop3ByOrderByGeekRatingDesc();
    
    /**
     * 단독 게임 수 조회
     */
    Long countByMinPlayersAndMaxPlayers(Integer minPlayers, Integer maxPlayers);
    
    /**
     * 파티 게임 수 조회 (4명 이상)
     */
    Long countByMinPlayersGreaterThan(Integer players);
    
    /**
     * 가볍 게임 수 조회 (weight 2.5 미만)
     */
    Long countByAverageWeightLessThan(BigDecimal weight);
    
    /**
     * 출시년도별 게임 수 조회 (최근 10년)
     */
    @Query(value = """
        SELECT 
            year_published,
            COUNT(*) as game_count
        FROM boardgame_trends 
        WHERE year_published IS NOT NULL 
            AND year_published >= :startYear
        GROUP BY year_published
        ORDER BY year_published DESC
        """, nativeQuery = true)
    List<Object[]> getGameCountByYear(Integer startYear);
    
    /**
     * 평점 범위별 게임 분포
     */
    @Query(value = """
        SELECT 
            rating_range,
            COUNT(*) as game_count,
            ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM boardgame_trends WHERE geek_rating IS NOT NULL)), 2) as percentage
        FROM (
            SELECT 
                CASE 
                    WHEN geek_rating >= 8.0 THEN '8.0+'
                    WHEN geek_rating >= 7.5 THEN '7.5-7.9'
                    WHEN geek_rating >= 7.0 THEN '7.0-7.4'
                    WHEN geek_rating >= 6.5 THEN '6.5-6.9'
                    WHEN geek_rating >= 6.0 THEN '6.0-6.4'
                    ELSE '~5.9'
                END as rating_range,
                geek_rating
            FROM boardgame_trends 
            WHERE geek_rating IS NOT NULL
        ) t
        GROUP BY rating_range
        ORDER BY MIN(geek_rating) DESC
        """, nativeQuery = true)
    List<Object[]> getRatingDistribution();
    
    /**
     * 상위 평점 게임들 (Top N)
     */
    @Query("SELECT bt FROM BoardgameTrend bt WHERE bt.geekRating IS NOT NULL ORDER BY bt.geekRating DESC")
    List<BoardgameTrend> findTopRatedGames(org.springframework.data.domain.Pageable pageable);
    
    /**
     * 게임 ID 존재 여부 확인 (중복 체크용)
     */
    boolean existsByGameId(String gameId);
}