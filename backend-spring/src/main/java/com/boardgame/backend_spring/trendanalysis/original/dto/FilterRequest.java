package com.boardgame.backend_spring.trendanalysis.original.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * 인터랙티브 필터링 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterRequest {
    
    /**
     * 최소 난이도 (기본값: 1.0)
     */
    private Double complexityMin = 1.0;
    
    /**
     * 최대 난이도 (기본값: 5.0)
     */
    private Double complexityMax = 5.0;
    
    /**
     * 플레이어 수 목록
     */
    private List<Integer> players;
    
    /**
     * 카테고리 목록
     */
    private List<String> categories;
    
    /**
     * 메카닉 목록
     */
    private List<String> mechanics;
    
    /**
     * 결과 제한 (기본값: 100)
     */
    private Integer limit = 100;
    
    /**
     * 정렬 기준 (rating, complexity, name 등)
     */
    private String sortBy = "rating";
    
    /**
     * 정렬 방향 (asc, desc)
     */
    private String sortDirection = "desc";
}