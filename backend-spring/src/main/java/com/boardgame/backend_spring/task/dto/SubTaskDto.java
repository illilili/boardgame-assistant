package com.boardgame.backend_spring.task.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 구성요소 하위 작업(SubTask) DTO
 */
@Data
@Builder
public class SubTaskDto {
    private Long contentId;
    private String type; // text, image, 3d_model 등
    private String status;
}
