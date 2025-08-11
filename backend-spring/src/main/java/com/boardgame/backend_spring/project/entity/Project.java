package com.boardgame.backend_spring.project.entity;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import com.boardgame.backend_spring.project.enumtype.ProjectStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Project {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    /** 프로젝트 상태(기본값: PLANNING) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProjectStatus status; // 예: DRAFT, IN_PROGRESS, DONE

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @ManyToMany(mappedBy = "projects")
    private List<User> participants;

    // 승인된 기획안 1개 (nullable 가능)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_plan_id")
    private Plan approvedPlan;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = ProjectStatus.PLANNING;
    }
}
