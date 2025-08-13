package com.boardgame.backend_spring.translate.entity;

import com.boardgame.backend_spring.content.entity.Content;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 번역 결과/작업 엔티티 (언어별 N행; 재요청 가능)
 * - 퍼블리셔 요청 시 targetLanguage별로 새 행 생성
 * - FastAPI 완료 시 translatedData 채움
 * - 승인/반려 단계 없음 (퍼블리셔가 직접 번역·확정)
 */
@Entity
@Table(
        name = "translation",
        indexes = {
                @Index(name = "idx_translation_content", columnList = "content_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Translation {

    public enum Status {
        REQUESTED,    // 요청됨
        IN_PROGRESS,  // FastAPI 처리 중
        COMPLETED,    // 번역 완료
        FAILED        // 번역 실패
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "translation_id")
    private Long translationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @Column(name = "target_language", nullable = false, length = 32)
    private String targetLanguage; // "en", "ja", "zh-Hant-TW" 등

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.REQUESTED;

    /** 동일 content+language로 재요청 시 1,2,3... 증가 */
    @Column(name = "iteration", nullable = false)
    private Integer iteration;

    /** 재요청 */
    @Lob
    @Column(name = "feedback", columnDefinition = "LONGTEXT")
    private String feedback;

    /** 번역 결과(JSON 문자열 허용) */
    @Lob
    @Column(name = "translated_data", columnDefinition = "LONGTEXT")
    private String translatedData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        if (this.iteration == null) this.iteration = 1; // 안전장치
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
