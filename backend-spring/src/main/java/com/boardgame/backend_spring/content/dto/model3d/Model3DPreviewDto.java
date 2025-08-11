package com.boardgame.backend_spring.content.dto.model3d;

import lombok.Data;

@Data
public class Model3DPreviewDto {
    private Long contentId;
    private String name;
    private String description;
    private String artConcept;
    private String theme;
    private String storyline;
}
