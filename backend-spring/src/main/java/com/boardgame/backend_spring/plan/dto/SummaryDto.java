package com.boardgame.backend_spring.plan.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

/** 기획서 생성 기능 관련 DTO */
public class SummaryDto {

    // React -> Spring 요청 DTO
    @Getter
    public static class Request {
        private Long conceptId;
    }

    // React에 컨셉 목록을 보내주기 위한 DTO
    @Getter
    @Builder
    public static class ConceptListInfo {
        private Long conceptId;
        private String theme;
    }

    // [수정] Spring -> FastAPI 요청 DTO
    @Builder
    @Getter
    public static class FastApiRequest {
        private String gameName; // gameName 필드 추가
        private ConceptInfo concept; // conceptInfo -> concept
        private GoalInfo goal;       // goalInfo -> goal
        private RuleInfo rule;       // ruleInfo -> rule
        private List<ComponentInfo> components; // componentInfo -> components
    }

    // --- FastAPI 요청에 포함될 세부 정보 DTO들 ---
    @Builder
    @Getter
    public static class ConceptInfo {
        private String theme;
        private String playerCount;
        private Double averageWeight;
        private String ideaText;
        private String mechanics;
        private String storyline;
    }

    @Builder
    @Getter
    public static class GoalInfo {
        private String mainGoal;
        private List<String> subGoals;
        private String winConditionType;
    }

    @Builder
    @Getter
    public static class RuleInfo {
        private String turnStructure;
        private List<String> actionRules;
        private String victoryCondition; // penaltyRules 대신 victoryCondition 포함
    }

    @Builder
    @Getter
    public static class ComponentInfo {
        // [수정] FastAPI의 ComponentItemSummary 모델과 필드명 일치
        private String title;
        private String role_and_effect;
    }
}