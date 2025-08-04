package com.boardgame.backend_spring.plan.entity;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
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
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Plan {

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

    /**
     * 새로운 Plan 객체를 생성하는 정적 팩토리 메소드입니다.
     * @param concept 기획서의 기반이 되는 컨셉
     * @param content AI가 생성한 초기 기획서 내용
     * @return 새로운 Plan 인스턴스
     */
    public static Plan create(BoardgameConcept concept, String content) {
        Plan plan = new Plan();
        plan.setBoardgameConcept(concept);
        plan.setCurrentContent(content);
        return plan;
    }
}
