package com.boardgame.backend_spring.concept.dto;

import lombok.Data;

@Data
public class RegenerateConceptRequestDto {
    private OriginalConcept originalConcept;
    private String feedback;

    // FastAPI의 Pydantic 모델과 구조를 맞추기 위한 중첩 클래스
    @Data
    public static class OriginalConcept {
        private long conceptId;
        private long planId;
        private String theme;
        private String playerCount;
        private double averageWeight;
        private String ideaText;
        private String mechanics;
        private String storyline;
        private String createdAt;
    }
}