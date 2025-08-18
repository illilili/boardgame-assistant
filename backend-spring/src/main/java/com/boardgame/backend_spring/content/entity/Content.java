package com.boardgame.backend_spring.content.entity;

import com.boardgame.backend_spring.component.entity.Component;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 콘텐츠(Content) 엔티티
 * - 카드 텍스트, 룰북, 스크립트, 썸네일 등 실제 콘텐츠 내용을 저장
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id") // 컬럼명 명시
    private Long contentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id")
    private Component component;

    @Column(nullable = false)
    private String contentType;

    private String name;         // 콘텐츠 이름 (예: 카드 이름)
    private String effect;       // 카드 효과 등
    private String description;  // 콘텐츠 설명
    @Lob
    @Column(name = "content_data", columnDefinition = "LONGTEXT")
    private String contentData;        // AI 생성 텍스트 등

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
