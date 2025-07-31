package com.boardgame.backend_spring.concept.dto;

import lombok.Data;

@Data
public class ConceptResponseDto {
    private int conceptId;
    private int planId;
    private String theme;
    private String playerCount;
    private double averageWeight;
    private String ideaText;
    private String mechanics;
    private String storyline;
    private String createdAt;
}