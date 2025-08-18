package com.boardgame.backend_spring.translate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 번역 후보(승인된 text 타입 콘텐츠) DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class TranslationCandidateDto {
    private Long contentId;     // 콘텐츠 ID
    private String name;        // 콘텐츠 이름(카드명, 룰북명 등)
    private String componentType; // 컴포넌트 타입 (card, rulebook 등)
    private String status;      // 컴포넌트 상태
}
