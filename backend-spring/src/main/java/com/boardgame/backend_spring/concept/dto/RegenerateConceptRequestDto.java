// `RegenerateConceptRequestDto.java`
package com.boardgame.backend_spring.concept.dto;

import lombok.Data;

@Data
public class RegenerateConceptRequestDto {
    private OriginalConcept originalConcept;
    private String feedback;

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