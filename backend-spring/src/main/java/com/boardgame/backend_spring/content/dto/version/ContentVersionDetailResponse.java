package com.boardgame.backend_spring.content.dto.version;

import com.boardgame.backend_spring.content.entity.ContentVersion;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ContentVersionDetailResponse {
    private Long versionId;
    private int versionNo;
    private String note;
    private LocalDateTime createdAt;
    private String data; // contentData 스냅샷

    public static ContentVersionDetailResponse from(ContentVersion v) {
        return ContentVersionDetailResponse.builder()
                .versionId(v.getVersionId())
                .versionNo(v.getVersionNo())
                .note(v.getNote())
                .createdAt(v.getCreatedAt())
                .data(v.getData()) // 저장된 snapshot
                .build();
    }
}