package com.boardgame.backend_spring.content.dto.version;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 콘텐츠 버전 단건 요약 DTO (목록용 아이템)
 */
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor @Builder
public class ContentVersionSummary {
    private Long versionId;
    private Integer versionNo;
    private String note;
    private String savedBy;
    private LocalDateTime createdAt;
}
