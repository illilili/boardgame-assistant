package com.boardgame.backend_spring.rule.dto;

import java.util.List;

public record GameRuleResponse(
        int ruleId,
        String turnStructure,
        List<String> actionRules,
        String victoryCondition,
        List<String> penaltyRules,
        String designNote
) {
}