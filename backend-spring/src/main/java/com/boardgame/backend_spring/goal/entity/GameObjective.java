package com.boardgame.backend_spring.goal.entity;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Entity
@Getter
@Setter
public class GameObjective {

    @Id
    private Long conceptId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "concept_id")
    private BoardgameConcept boardgameConcept;

    @Column(length = 500)
    private String mainGoal;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sub_goals", joinColumns = @JoinColumn(name = "objective_id"))
    @Column(name = "goal", length=500)
    private List<String> subGoals;

    private String winConditionType;

    @Column(length = 1000)
    private String designNote;
}