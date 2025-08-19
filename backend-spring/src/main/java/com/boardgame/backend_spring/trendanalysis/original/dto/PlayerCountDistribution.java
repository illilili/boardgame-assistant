package com.boardgame.backend_spring.trendanalysis.original.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlayerCountDistribution {
    private String playerRange;
    private Long count;
    private Double percentage;
    private String description;
}