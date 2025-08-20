// src/main/java/com/boardgame/backend_spring/rule/entity/GameRule.java
package com.boardgame.backend_spring.rule.entity;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.List;

@Entity
@Getter
@Setter
public class GameRule {

    @Id
    private Long conceptId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "concept_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private BoardgameConcept boardgameConcept;

    private int ruleId;

    @Column(length = 1000)
    private String turnStructure;

    @ElementCollection(fetch = FetchType.LAZY) // 🚨 LAZY로 변경
    @CollectionTable(name = "action_rules", joinColumns = @JoinColumn(name = "rule_concept_id"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    @Column(name = "rule", length = 1000)
    private List<String> actionRules;

    @Column(length = 1000)
    private String victoryCondition;

    @ElementCollection(fetch = FetchType.LAZY) // 🚨 LAZY로 변경
    @CollectionTable(name = "penalty_rules", joinColumns = @JoinColumn(name = "rule_concept_id"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    @Column(name = "rule", length = 1000)
    private List<String> penaltyRules;

    @Column(length = 1000)
    private String designNote;
}