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

    // [수정] 상세 정보를 담을 필드 추가
    @Column(length = 2000)
    private String roleAndEffect; // 역할과 효과

    @Column(length = 1000)
    private String artConcept; // 아트 컨셉

    @Column(length = 1000)
    private String interconnection; // 상호작용

    private String quantity; // 수량

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id")
    private BoardgameConcept boardgameConcept;

    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubTask> subTasks = new ArrayList<>();
}
