package com.boardgame.backend_spring.concept.dto;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import lombok.Data;

@Data
public class ConceptResponseDto {
    // [수정] int -> long 으로 변경
    private long conceptId;
    private long planId;
    private String theme;
    private String playerCount;
    private double averageWeight;
    private String ideaText;
    private String mechanics;
    private String storyline;
    private String createdAt;

    // 목록 조회를 위한 Simple DTO는 변경할 필요 없습니다.
    @Data
    public static class Simple {
        private Long conceptId;
        private Long planId;
        private String theme;

        public Simple(BoardgameConcept entity) {
            this.conceptId = entity.getConceptId();
            this.planId = entity.getPlanId();
            this.theme = entity.getTheme();
        }
    }
}