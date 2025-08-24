package com.boardgame.backend_spring.trendanalysis.original.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * 게임 요약 정보 DTO (실시간 결과 목록용)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameSummary {
    
    /**
     * 게임 ID
     */
    private String gameId;
    
    /**
     * 게임 이름
     */
    private String name;
    
    /**
     * 평균 평점
     */
    private Double averageRating;
    
    /**
     * 평균 난이도
     */
    private Double averageWeight;
    
    /**
     * 최소 플레이어 수
     */
    private Integer minPlayers;
    
    /**
     * 최대 플레이어 수
     */
    private Integer maxPlayers;
    
    /**
     * 출시 연도
     */
    private Integer yearPublished;
    
    /**
     * 플레이 시간 (분)
     */
    private Integer playingTime;
    
    /**
     * 카테고리 목록
     */
    private List<String> categories;
    
    /**
     * 메카닉 목록
     */
    private List<String> mechanics;
    
    /**
     * BGG 순위 (있는 경우)
     */
    private Integer bggRank;
    
    /**
     * 게임 설명 (요약)
     */
    private String description;
    
    /**
     * 추가 태그 정보
     */
    private List<String> tags;
}