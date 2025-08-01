package com.boardgame.backend_spring.content.entity;

import com.boardgame.backend_spring.component.entity.Component;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id")
    private Component component;

    private String type;   // 예: TEXT, IMAGE, 3D_MODEL 등
    private String status; // 예: NOT_STARTED, DONE, etc.

    @Lob
    private String generatedContent;  // 텍스트 or 이미지 URL 등
}
