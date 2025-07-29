package com.boardgame.backend_spring.plan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanConcept {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String theme;  // ex: 판타지, 미래, 고대 문명 등

    @Column(columnDefinition = "TEXT")
    private String storyline;

    @OneToOne
    @JoinColumn(name = "plan_id")
    private Plan plan;
}
