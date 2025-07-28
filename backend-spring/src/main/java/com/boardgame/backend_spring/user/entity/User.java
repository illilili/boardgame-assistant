package com.boardgame.backend_spring.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String email;

    private String password;

    private String name;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String company;

    public enum Role {
        PLANNER, DEVELOPER, PUBLISHER, ADMIN
    }
}
