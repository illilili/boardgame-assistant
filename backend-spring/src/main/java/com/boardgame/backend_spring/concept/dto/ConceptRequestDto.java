package com.boardgame.backend_spring.concept.dto;

import lombok.Data;

@Data // Getter, Setter, toString 등을 자동 생성
public class ConceptRequestDto {
    private String theme;
    private String playerCount;
    private double averageWeight;
}