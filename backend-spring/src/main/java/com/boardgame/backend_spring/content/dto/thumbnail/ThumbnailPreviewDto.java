package com.boardgame.backend_spring.content.dto.thumbnail;

import lombok.Data;

@Data
public class ThumbnailPreviewDto {
    private Long contentId;
    private String theme;
    private String storyline;
}
