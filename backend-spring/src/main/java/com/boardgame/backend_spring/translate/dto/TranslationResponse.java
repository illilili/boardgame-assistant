package com.boardgame.backend_spring.translate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 번역 요청 응답 DTO
 * - contentId 기준으로 생성(또는 요청)된 번역 행들의 요약 리스트
 */
@Getter
@AllArgsConstructor
public class TranslationResponse {
    private Long contentId;
    private List<TranslationItemDto> items;
}
