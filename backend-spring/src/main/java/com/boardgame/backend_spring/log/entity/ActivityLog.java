package com.boardgame.backend_spring.log.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 예: "PROJECT_CREATE", "PLAN_SUBMIT", "COMPONENT_SUBMIT", "PLAN_APPROVE"
    @Column(nullable = false)
    private String action;

    // PLAN, CONTENT, PROJECT 등 엔티티 종류
    @Column(nullable = false, length = 30)
    private String targetType;

    // 타겟 ID (프로젝트, 기획안, 컴포넌트 등)
    private Long targetId;

    private Long projectId;

    // 작업자 이름 (풀 네임)
    @Column(nullable = false)
    private String username;

    private LocalDateTime timestamp;
}
