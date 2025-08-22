package com.boardgame.backend_spring.content.dto;

import lombok.Data;

@Data
public class GenericPreviewDto {
    private Long contentId;
    private Long componentId;
    private String title;
    private String roleAndEffect;
    private String artConcept;
    private String interconnection;
}
