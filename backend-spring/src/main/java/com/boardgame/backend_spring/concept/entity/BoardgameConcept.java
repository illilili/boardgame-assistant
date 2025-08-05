package com.boardgame.backend_spring.concept.entity;


import com.boardgame.backend_spring.project.entity.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class BoardgameConcept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long conceptId;

    @Column(unique = true)
    private Long planId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private String theme;
    private String playerCount;
    private Double averageWeight;
    @Column(length = 1000)
    private String ideaText;
    @Column(length = 500)
    private String mechanics;
    @Column(length = 1000)
    private String storyline;
    private String createdAt;


}