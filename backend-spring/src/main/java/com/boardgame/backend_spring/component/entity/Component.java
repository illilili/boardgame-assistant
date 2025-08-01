package com.boardgame.backend_spring.component.entity;

import com.boardgame.backend_spring.plan.entity.Plan;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 연결된 프로젝트 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    private String type;        // 예: card, token, board, rulebook 등
    private String title;
    private String effect;      // 카드/토큰용
    private String description;
}
