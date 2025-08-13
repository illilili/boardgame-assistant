package com.boardgame.backend_spring.review.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 퍼블리셔 검수 화면용 컴포넌트 상세 DTO
 * - 컴포넌트 기본 + SubTask + Content(미리보기/본문)까지 포함
 */
@Getter
@Builder
public class ComponentReviewDetailDto {
    private Long componentId;
    private String title;
    private String type;
    private String status; // PENDING_REVIEW/APPROVED/REJECTED 등

    private List<Item> items; // SubTask 단위

    @Getter
    @Builder
    public static class Item {
        private Long contentId;
        private String subTaskType;  // text / image / 3d_model / rulebook / thumbnail ...
        private String subTaskStatus; // COMPLETED 등

        // Content 상세(있으면 매핑)
        private String contentType;   // 카드텍스트/이미지/룰북 등 구분(있다면)
        private String contentData;   // 텍스트 본문, 또는 S3 URL 등
        private String note;          // 버전/비고 등 필요시
    }
}
