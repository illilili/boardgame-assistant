package com.boardgame.backend_spring.content.dto.card;

import lombok.Data;

/**
 * [DTO] 카드 텍스트 생성을 위한 사용자 요청 데이터
 * - 프론트엔드에서 사용자가 입력하는 정보만 포함됨
 * - contentId 기반으로 theme, storyline은 백엔드에서 자동 채움
 */
@Data
public class CardTextGenerateRequest {

    private Long contentId;

    private String name;

    private String effect;

    private String description;
}
