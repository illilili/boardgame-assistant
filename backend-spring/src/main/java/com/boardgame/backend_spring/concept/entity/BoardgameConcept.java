package com.boardgame.backend_spring.concept.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor // JPA에서 엔티티를 생성할 때 필요
public class BoardgameConcept {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long conceptId;

    private Long planId;
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

    // 다른 필요한 생성자나 메서드를 추가할 수 있습니다.
}