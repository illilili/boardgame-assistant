// 파일: component/entity/Component.java
package com.boardgame.backend_spring.component.entity;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long componentId;

    private String type;
    @Column(length = 500)
    private String title;

    @Column(length = 2000)
    private String roleAndEffect;

    @Column(length = 1000)
    private String artConcept;

    @Column(length = 1000)
    private String interconnection;

    private String quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id")
    private BoardgameConcept boardgameConcept;

    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubTask> subTasks = new ArrayList<>();
}