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
    private String name; // 🚨 개별 콘텐츠(카드) 이름
    private String effect; // 🚨 개별 콘텐츠(카드) 효과
}
