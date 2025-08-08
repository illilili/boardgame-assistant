package com.boardgame.backend_spring.content.dto.version;

import lombok.Getter;
import lombok.Setter;

/**
 * 콘텐츠 버전 저장 요청 DTO
 * - contentId: 어떤 콘텐츠의 버전을 저장할지
 * - note/savedBy: 선택 입력 메타 정보
 */
@Getter @Setter
public class ContentSaveRequest {
    private Long contentId;
    private String note;    // optional
}