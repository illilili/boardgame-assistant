package com.boardgame.backend_spring.trendanalysis.original.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 버블 차트 데이터 DTO
 * X축: 평균 평점, Y축: 평균 난이도, 크기: 게임 수
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BubbleChartData {
    
    /**
     * 그룹 이름 (카테고리명 또는 메카닉명)
     */
    private String group;
    
    /**
     * X축 값 (평균 평점)
     */
    private Double x;
    
    /**
     * Y축 값 (평균 난이도)
     */
    private Double y;
    
    /**
     * 버블 크기 (게임 수)
     */
    private Integer size;
    
    /**
     * 해당 그룹의 샘플 게임들
     */
    private List<Map<String, Object>> games;
    
    /**
     * 추가 통계 정보
     */
    private Map<String, Object> statistics;
}