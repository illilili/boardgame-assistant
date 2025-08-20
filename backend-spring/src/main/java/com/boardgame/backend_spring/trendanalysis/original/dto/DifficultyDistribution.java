package com.boardgame.backend_spring.trendanalysis.original.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DifficultyDistribution {
    private String level;
    private Long count;
    private Double percentage;
    private Double averageWeight;
    private String description;
}