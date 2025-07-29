package com.boardgame.backend_spring.plan.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String ruleText;

    @OneToOne
    @JoinColumn(name = "plan_id")
    private Plan plan;
}
