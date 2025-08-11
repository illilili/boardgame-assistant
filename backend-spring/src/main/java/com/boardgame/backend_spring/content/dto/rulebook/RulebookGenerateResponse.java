package com.boardgame.backend_spring.content.dto.rulebook;

import lombok.Data;

/**
 * 룰북 생성 결과 DTO
 */
@Data
public class RulebookGenerateResponse {
    private Long contentId;
    private String rulebookText;  // 생성된 룰북 전체 텍스트
}
