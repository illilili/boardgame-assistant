package com.boardgame.backend_spring.plan.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 기획서의 특정 시점 버전을 저장하는 엔티티입니다.
 * 하나의 기획서(Plan)는 여러 개의 버전(PlanVersion)을 가질 수 있습니다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long versionId;

    // 어떤 기획서에 대한 버전인지 N:1 관계를 맺습니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    // 사용자가 입력한 버전 이름 (예: "v1.1 - 밸런스 수정")
    @Column(nullable = false)
    private String versionName;

    // 버전에 대한 간단한 메모 (선택 사항)
    private String memo;

    // 해당 버전이 저장될 당시의 기획서 전체 내용
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String planContent;

    // 버전 저장 시각 (자동 생성)
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * 새로운 PlanVersion 객체를 생성하는 정적 팩토리 메소드입니다.
     * @param plan 이 버전을 포함하는 부모 기획서
     * @param versionName 사용자가 지정한 버전 이름
     * @param memo 버전에 대한 메모
     * @return 새로운 PlanVersion 인스턴스
     */
    public static PlanVersion create(Plan plan, String versionName, String memo) {
        PlanVersion version = new PlanVersion();
        version.setPlan(plan);
        version.setVersionName(versionName);
        version.setMemo(memo);
        version.setPlanContent(plan.getCurrentContent()); // 저장 시점의 Plan 내용을 복사
        return version;
    }
}
