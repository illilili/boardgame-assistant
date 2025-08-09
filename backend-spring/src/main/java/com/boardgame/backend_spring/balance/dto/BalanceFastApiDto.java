package com.boardgame.backend_spring.balance.dto;

import lombok.Builder;
import java.util.List;

/** FastAPI와 통신하기 위한 내부 전용 DTO */
public class BalanceFastApiDto {

    @Builder
    public record SimulationRequest(GameRuleDetails rules, List<String> playerNames, int maxTurns, boolean enablePenalty) {}

    @Builder
    public record AnalysisRequest(GameRuleDetails rules) {}

    @Builder
    public record GameRuleDetails(
            int ruleId,
            String gameName,
            String turnStructure,
            List<String> actionRules,
            String victoryCondition,
            List<String> penaltyRules
    ) {}
}