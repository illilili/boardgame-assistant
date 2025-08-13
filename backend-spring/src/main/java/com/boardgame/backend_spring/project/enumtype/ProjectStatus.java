package com.boardgame.backend_spring.project.enumtype;

/**
 * 프로젝트 상위 상태(단일)
 * - PLANNING: 기획 중
 * - REVIEW_PENDING: 기획안 제출, 승인 대기
 * - DEVELOPMENT: 개발(콘텐츠 제작) 진행 중
 * - PUBLISHING: 번역/가격 책정 등 출판 단계 진행 중
 * - COMPLETED: 최종 완료
 */
public enum ProjectStatus {
    PLANNING, REVIEW_PENDING, DEVELOPMENT, PUBLISHING, COMPLETED
}
