package com.boardgame.backend_spring.translate.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * FastAPI → Spring 콜백 DTO
 * - translationId: 번역 행 ID
 * - status: COMPLETED or FAILED
 * - translatedData: 번역 결과(JSON/텍스트) - COMPLETED일 때 세팅
 */
@Getter
@Setter
@NoArgsConstructor
public class TranslationCallbackRequest {
    private Long translationId;
    private String status;        // "COMPLETED" | "FAILED"
    private String translatedData;
}
