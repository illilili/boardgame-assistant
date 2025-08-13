package com.boardgame.backend_spring.translate.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 다국어 번역 요청 DTO
 * - contentId: 번역할 콘텐츠 ID
 * - targetLanguages: 번역 언어 목록
 * - feedback: 재요청 가이드/사유 (선택)
 */
@Getter
@Setter
@NoArgsConstructor
public class TranslationRequest {
    private Long contentId;
    private List<String> targetLanguages; // ["en","ja","zh-Hant-TW"]
    private String feedback;              // 선택
}
