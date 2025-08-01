package com.boardgame.backend_spring.rule.dto;

import java.util.List;

public class RegenerateRuleDto {

    /** 클라이언트(React) -> 서버 요청 DTO */
    public record Request(
            int ruleId, // AI가 생성한 고유 규칙 ID
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
            // 게임 컨셉 정보
            String theme,
            String mechanics,
            String mainGoal,
            // 개선할 원본 규칙 정보
            int original_ruleId,
            String original_turnStructure,
            List<String> original_actionRules,
            String original_victoryCondition,
            List<String> original_penaltyRules,
            // 사용자 피업
            String feedback
    ) {}
}
