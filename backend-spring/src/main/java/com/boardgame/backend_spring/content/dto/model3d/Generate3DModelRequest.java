package com.boardgame.backend_spring.content.dto.model3d;

import lombok.Getter;
import lombok.Setter;

/**
 * FastAPI로 3D 모델 생성을 요청할 때 사용하는 요청 DTO
 */
@Getter
@Setter
public class Generate3DModelRequest {
    private Long contentId;
    private String name;
    private String description;
    private String componentInfo;
    private String theme;
    private String storyline;
    private String style;
}