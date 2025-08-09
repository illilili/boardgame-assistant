package com.boardgame.backend_spring.content.dto.card;

import lombok.Data;
import java.util.List;

@Data
public class CardTextRequest {
    private Long planId;
    private String theme;
    private String storyline;
    private List<Card> cards;

    @Data
    public static class Card {
        private Long contentId;
        private String name;
        private String effect;
        private String description;
    }
}
