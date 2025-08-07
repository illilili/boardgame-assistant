package com.boardgame.backend_spring.content.dto.rulebook;

import lombok.Data;

/**
 * 룰북 생성 요청 DTO
 * - contentId만 넘기면, 백엔드에서 컨셉/규칙 정보 찾아서 Python에 전달
 */
@Data
public class RulebookGenerateRequest {
    private Long contentId;
}
