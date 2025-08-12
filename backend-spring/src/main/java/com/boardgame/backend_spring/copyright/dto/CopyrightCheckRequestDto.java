package com.boardgame.backend_spring.copyright.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 프론트 → 스프링 → FastAPI 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CopyrightCheckRequestDto {
    private Long planId;
    private String summaryText; // 기획안 요약
}
