// `ConceptRequestDto.java`
package com.boardgame.backend_spring.concept.dto;

import lombok.Data;

@Data
public class ConceptRequestDto {
    private Long projectId; // 🚨 projectId 필드 추가
    private String theme;
    private String playerCount;
    private double averageWeight;
}