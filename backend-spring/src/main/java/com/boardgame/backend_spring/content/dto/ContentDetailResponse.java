package com.boardgame.backend_spring.content.dto;

import com.boardgame.backend_spring.content.entity.Content;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ContentDetailResponse {
    private Long contentId;
    private Long componentId;     // 연관 컴포넌트 ID (nullable)
    private String contentType;
    private String name;
    private String effect;
    private String description;
    private String contentData;   // LONGTEXT
    private LocalDateTime createdAt;

    public static ContentDetailResponse from(Content c) {
        return ContentDetailResponse.builder()
                .contentId(c.getContentId())
                .componentId(c.getComponent() != null ? c.getComponent().getComponentId() : null)
                .contentType(c.getContentType())
                .name(c.getName())
                .effect(c.getEffect())
                .description(c.getDescription())
                .contentData(c.getContentData())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
