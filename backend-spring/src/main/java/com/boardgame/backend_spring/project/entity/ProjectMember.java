package com.boardgame.backend_spring.project.entity;

import com.boardgame.backend_spring.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_members")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role {
        PLANNER, DEVELOPER, PUBLISHER
    }
}
