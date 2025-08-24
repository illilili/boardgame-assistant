// `ConceptResponseDto.java`
package com.boardgame.backend_spring.concept.dto;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import lombok.Data;

@Data
public class ConceptResponseDto {
    private long conceptId;
    private long planId;
    private long projectId;
    private String theme;
    private String playerCount;
    private double averageWeight;
    private String ideaText;
    private String mechanics;
    private String storyline;
    private String createdAt;

    @Data
    public static class Simple {
        private Long conceptId;
        private Long planId;
        private String theme;

        public Simple(BoardgameConcept entity, Long planId) {
            this.conceptId = entity.getConceptId();
//            this.planId = entity.getPlanId();
            this.planId = planId;
            this.theme = entity.getTheme();
        }
    }
}