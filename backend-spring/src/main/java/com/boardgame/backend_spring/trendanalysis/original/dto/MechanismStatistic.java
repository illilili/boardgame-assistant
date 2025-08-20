package com.boardgame.backend_spring.trendanalysis.original.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MechanismStatistic {
    private String mechanism;
    private Long count;
    private Double percentage;
    private Double avgRating;     // 평균 평점
    private Double avgComplexity; // 평균 난이도
}