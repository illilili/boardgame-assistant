package com.boardgame.backend_spring.plan.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/** 기획안 버전 관리 기능 관련 DTO */
public class PlanVersionDto {

    // 버전 저장 요청 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    public static class SaveRequest {
        private Long planId;
        private String versionName;
        private String memo;
        private String planContent; // 사용자가 수정한 최신 내용을 받아오기 위함
    }

    // 버전 저장 응답 DTO
    @Getter
    @Builder
    public static class SaveResponse {
        private Long versionId;
        private String versionName;
        private LocalDateTime savedAt;
        private String message;
    }

    // 버전 롤백 요청 DTO
    @Getter
    @Setter
    @NoArgsConstructor
    public static class RollbackRequest {
        private Long versionId;
    }

    // 버전 롤백 응답 DTO
    @Getter
    @Builder
    public static class RollbackResponse {
        private Long planId;
        private Long versionId;
        private String rolledBackContent; // 롤백된 내용을 프론트에 바로 적용하기 위함
        private LocalDateTime rolledBackAt;
        private String message;
    }

    // 버전 목록 응답 DTO
    @Getter
    @Builder
    public static class VersionListResponse {
        private Long planId;
        private List<VersionInfo> versions;
    }

    // 개별 버전 정보 DTO
    @Getter
    @Builder
    public static class VersionInfo {
        private Long versionId;
        private String versionName;
        private String memo;
        private LocalDateTime createdAt;
    }
}