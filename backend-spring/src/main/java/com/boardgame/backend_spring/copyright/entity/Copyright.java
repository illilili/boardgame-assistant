package com.boardgame.backend_spring.copyright.entity;

import com.boardgame.backend_spring.plan.entity.Plan;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "copyright_check")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Copyright {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false, unique = true)
    private Plan plan;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel; // SAFE, CAUTION, DANGER

    @Lob
    @Column(name = "similar_games_json", columnDefinition = "LONGTEXT")
    private String similarGamesJson; // JSON 형태

    @Lob
    @Column(name = "analysis_summary", columnDefinition = "LONGTEXT")
    private String analysisSummary; // 저작권 검사 결과 요약문

    @Column(name = "checked_at", nullable = false)
    private LocalDateTime checkedAt;
}