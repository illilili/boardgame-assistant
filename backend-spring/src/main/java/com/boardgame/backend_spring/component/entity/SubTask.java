// 파일: component/entity/SubTask.java
package com.boardgame.backend_spring.component.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long contentId;

    private String type; // text, image, 3d_model 등
    private String status; // NOT_STARTED, IN_PROGRESS COMPLETED등

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id")
    private Component component;
}