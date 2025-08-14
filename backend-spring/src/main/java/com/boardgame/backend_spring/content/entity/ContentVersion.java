package com.boardgame.backend_spring.content.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * 콘텐츠 스냅샷 버전
 * - Content의 특정 시점 contentData를 저장
 * - 버전은 1부터 시작, 삭제해도 기존 번호 유지(재번호 금지)
 */
@Entity
@Getter
@Setter // ← 세터 추가
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "version_id")
    private Long versionId;

    /** 어떤 콘텐츠의 버전인지 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content; // ← 필드명을 content로 변경(원래 contentId였음)

    /** 1,2,3 ... */
    @Column(nullable = false)
    private Integer versionNo;

    /** 스냅샷 데이터(JSON/Text) */
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String data;

    /** 메타데이터(옵션) */
    private String note;        // 저장 사유/메모

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
