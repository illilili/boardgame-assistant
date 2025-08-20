package com.boardgame.backend_spring.pricing.entity;

import com.boardgame.backend_spring.plan.entity.Plan;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

/**
 * 퍼블리셔 가격 책정 결과 저장 엔티티
 */
@Entity
@Table(name = "price")
@Getter
@Setter
@NoArgsConstructor
public class Price {

    @Id
    @Column(name = "plan_id")
    private Long planId; // Plan PK와 동일 (1:1)

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "plan_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Plan plan;

    @Column(nullable = false)
    private double predictedPrice; // 달러 단위

    @Column(nullable = false)
    private int korPrice; // 원화

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
