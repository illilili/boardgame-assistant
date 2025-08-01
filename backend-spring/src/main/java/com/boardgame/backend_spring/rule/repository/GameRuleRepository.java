package com.boardgame.backend_spring.rule.repository;

import com.boardgame.backend_spring.rule.entity.GameRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional; // Optional 임포트

public interface GameRuleRepository extends JpaRepository<GameRule, Long> {
    // AI가 생성한 ruleId로 GameRule 엔티티를 찾는 메소드 추가
    Optional<GameRule> findByRuleId(int ruleId);
}