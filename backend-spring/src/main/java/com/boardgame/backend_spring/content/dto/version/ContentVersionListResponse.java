package com.boardgame.backend_spring.content.dto.version;

import lombok.*;
import java.util.List;

/**
 * 특정 콘텐츠의 버전 목록 응답 DTO
 */
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor @Builder
public class ContentVersionListResponse {
    private Long contentId;
    private List<ContentVersionSummary> versions;
}