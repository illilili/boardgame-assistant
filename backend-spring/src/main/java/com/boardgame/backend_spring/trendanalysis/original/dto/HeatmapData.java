package com.boardgame.backend_spring.trendanalysis.original.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 히트맵 데이터 DTO
 * X축: 플레이어 수, Y축: 난이도 구간, 값: 게임 수
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapData {
    
    /**
     * X축 값 (플레이어 수 범위)
     * 예: "1인", "2인", "3-4인", "5-6인", "7인+"
     */
    private String x;
    
    /**
     * Y축 값 (난이도 범위)
     * 예: "초급 (1.0-2.0)", "중급 (2.0-3.0)", "상급 (3.0-4.0)", "전문가 (4.0+)"
     */
    private String y;
    
    /**
     * 히트맵 셀 값 (해당 조건의 게임 수)
     */
    private Long value;
    
    /**
     * 전체 대비 비율 (%)
     */
    private Double percentage;
    
    /**
     * 추가 통계 정보
     */
    private String description;
    
    /**
     * 색상 강도 (0.0 ~ 1.0)
     */
    private Double intensity;
}