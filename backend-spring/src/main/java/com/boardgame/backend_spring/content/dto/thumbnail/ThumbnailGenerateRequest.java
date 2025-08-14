package com.boardgame.backend_spring.content.dto.thumbnail;

import lombok.Data;

@Data
public class ThumbnailGenerateRequest {
    private Long contentId;
    private String theme;
    private String storyline;
}