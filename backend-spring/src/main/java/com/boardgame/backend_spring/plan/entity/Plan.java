package com.boardgame.backend_spring.plan.entity;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.project.entity.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 생성된 기획서의 현재 상태를 저장하는 엔티티입니다.
 * 각 컨셉(BoardgameConcept) 당 하나의 기획서(Plan)를 가집니다.
 */
@Entity
@Table(name = "plan")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Plan {
    // Plan은 특정 Project에 속해 있습니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long planId;

    // 기획서의 기반이 되는 컨셉과 1:1 관계를 맺습니다.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id", unique = true, nullable = false)
    private BoardgameConcept boardgameConcept;

    // 사용자가 수정한 내용을 포함한 기획서의 현재 내용을 저장합니다.
    @Lob
    @Column(columnDefinition = "TEXT")
    private String currentContent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanStatus status = PlanStatus.DRAFT;

    // 반려 사유 (승인 시 null)
    @Column(length = 1000)
    private String rejectionReason;

    /**
     * 새로운 Plan 객체를 생성하는 정적 팩토리 메소드입니다.
     * @param concept 기획서의 기반이 되는 컨셉
     * @param content AI가 생성한 초기 기획서 내용
     * @return 새로운 Plan 인스턴스
     */
    public static Plan create(Project project, BoardgameConcept concept, String content) {
        if (!concept.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("컨셉과 프로젝트가 일치하지 않습니다.");
        }

        Plan plan = new Plan();
        plan.setProject(project);
        plan.setBoardgameConcept(concept);
        plan.setCurrentContent(content);
        return plan;
    }
}
