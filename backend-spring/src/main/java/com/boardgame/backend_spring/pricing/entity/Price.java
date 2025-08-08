package com.boardgame.backend_spring.pricing.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.boardgame.backend_spring.plan.entity.Plan;

@Entity
@Table(name = "price")
public class Price {

    @Id
    @Column(name = "plan_id")
    private Long planId;

    @OneToOne
    @JoinColumn(name = "plan_id", referencedColumnName = "plan_id", insertable = false, updatable = false)
    private Plan plan;

    @Column(name = "predicted_price", nullable = false)
    private Float predictedPrice;

    @Column(name = "kor_price", nullable = false)
    private Integer korPrice;

    @Column(name = "updated_at", insertable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    // Getters & Setters 생략 가능 (롬복 사용 시 @Getter @Setter)
}
