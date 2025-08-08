package com.boardgame.backend_spring.project.entity;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

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

    private String status; // 예: DRAFT, IN_PROGRESS, DONE

    private Integer price; // 자동 책정 후 저장됨

    private LocalDateTime createdAt;

    @ManyToMany(mappedBy = "projects")
    private List<User> participants;

    // 승인된 기획안 1개 (nullable 가능)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_plan_id")
    private Plan approvedPlan;
}
