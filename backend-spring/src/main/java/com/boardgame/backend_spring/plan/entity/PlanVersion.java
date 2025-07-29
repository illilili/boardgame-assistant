package com.boardgame.backend_spring.plan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long originalPlanId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String concept;
    @Column(columnDefinition = "TEXT")
    private String goal;
    @Column(columnDefinition = "TEXT")
    private String rule;

    private LocalDateTime createdAt;
}
