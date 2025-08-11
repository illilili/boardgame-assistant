package com.boardgame.backend_spring.review.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 프로젝트별 승인 대기 컴포넌트 그룹 DTO
 */
@Getter
@Builder
public class PendingComponentGroupDto {
    private Long projectId;
    private String projectTitle;
    private List<PendingComponentDto> items; // 해당 프로젝트의 컴포넌트 목록
}
