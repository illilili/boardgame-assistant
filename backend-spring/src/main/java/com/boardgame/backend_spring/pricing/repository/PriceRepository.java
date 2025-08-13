package com.boardgame.backend_spring.pricing.repository;

import com.boardgame.backend_spring.pricing.entity.Price;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceRepository extends JpaRepository<Price, Long> {
}
