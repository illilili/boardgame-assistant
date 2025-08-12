package com.boardgame.backend_spring.rule.dto;

import java.util.List;

public class RegenerateRuleDto {

    /** 클라이언트(React) -> 서버 요청 DTO */
    public record Request(
            int conceptId,
            int ruleId,
            String feedback
    ) {}

    /** 서버 -> 클라이언트 응답 DTO */
    public record Response(
            int ruleId,
            String turnStructure,
            List<String> actionRules,
            String victoryCondition,
            List<String> penaltyRules,
            String designNote
    ) {}

    /** 서버 -> FastAPI 요청에 사용할 내부 DTO */
    public record FastApiRequest(
            String theme,
            String mechanics,
            String mainGoal,
            int original_ruleId,
            String original_turnStructure,
            List<String> original_actionRules,
            String original_victoryCondition,
            List<String> original_penaltyRules,
            String feedback
    ) {}
}