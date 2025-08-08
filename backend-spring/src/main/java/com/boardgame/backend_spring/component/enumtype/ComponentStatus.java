package com.boardgame.backend_spring.component.enumtype;

/**
 * 컴포넌트(콘텐츠 묶음) 상태
 * - 제출 흐름까지 포함
 */
public enum ComponentStatus {
    WAITING,         // 모든 SubTask가 NOT_STARTED
    IN_PROGRESS,     // 일부 진행
    READY_TO_SUBMIT, // 모든 SubTask가 COMPLETED
    PENDING_REVIEW,  // 제출됨(승인 대기)
    APPROVED,        // 승인
    REJECTED         // 반려
}
