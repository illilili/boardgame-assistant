package com.boardgame.backend_spring.content.dto.version;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 콘텐츠 버전 저장 응답 DTO
 */
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor @Builder
public class ContentSaveResponse {
    private Long versionId;
    private Long contentId;
    private Integer versionNo;
    private String note;
    private String savedBy;
    private LocalDateTime createdAt;
}