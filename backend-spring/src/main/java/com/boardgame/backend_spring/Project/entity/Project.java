package com.boardgame.backend_spring.project.entity;

import com.boardgame.backend_spring.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
}
