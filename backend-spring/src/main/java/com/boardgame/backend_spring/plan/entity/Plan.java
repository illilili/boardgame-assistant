package com.boardgame.backend_spring.plan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private String title;

    @Enumerated(EnumType.STRING)
    private PlanStatus status;  // CREATED, SUBMITTED, APPROVED 등

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 관계 설정
    @OneToOne(mappedBy = "plan", cascade = CascadeType.ALL)
    private PlanConcept concept;

    @OneToOne(mappedBy = "plan", cascade = CascadeType.ALL)
    private PlanGoal goal;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    private List<PlanComponent> components;

    @OneToOne(mappedBy = "plan", cascade = CascadeType.ALL)
    private PlanRule rule;
}
