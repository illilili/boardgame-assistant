package com.boardgame.backend_spring.content.dto.card;

import lombok.Data;

@Data
public class CardPreviewDto {
    private Long contentId;
    private String name;
    private String effect;
    private String description;
    private String theme;
    private String storyline;
}
