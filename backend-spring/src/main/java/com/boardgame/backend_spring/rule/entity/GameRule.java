// src/main/java/com/boardgame/backend_spring/rule/entity/GameRule.java
package com.boardgame.backend_spring.rule.entity;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class GameRule {

    @Id
    private Long conceptId; // BoardgameConcept의 ID를 기본 키로 사용

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // BoardgameConcept의 PK를 자신의 PK로 매핑
    @JoinColumn(name = "concept_id")
    private BoardgameConcept boardgameConcept;

    private int ruleId; // AI가 생성한 임의의 ruleId

    @Column(length = 1000)
    private String turnStructure;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "action_rules", joinColumns = @JoinColumn(name = "rule_concept_id"))
    @Column(name = "rule", length = 1000)
    private List<String> actionRules;

    @Column(length = 1000)
    private String victoryCondition;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "penalty_rules", joinColumns = @JoinColumn(name = "rule_concept_id"))
    @Column(name = "rule", length = 1000)
    private List<String> penaltyRules;

    @Column(length = 1000)
    private String designNote;
}