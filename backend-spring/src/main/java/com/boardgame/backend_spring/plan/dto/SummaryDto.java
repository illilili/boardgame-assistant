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

    // [신규 추가] React에 컨셉 목록을 보내주기 위한 DTO
    @Getter
    @Builder
    public static class ConceptListInfo {
        private Long conceptId;
        private String theme;
    }

    // Spring -> FastAPI 요청 DTO (기존과 동일)
    @Builder
    @Getter
    public static class FastApiRequest {
        private ConceptInfo conceptInfo;
        private GoalInfo goalInfo;
        private RuleInfo ruleInfo;
        private List<ComponentInfo> componentInfo;
    }

    // --- FastAPI 요청에 포함될 세부 정보 DTO들 (기존과 동일) ---
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
        private List<String> penaltyRules;
    }

    @Builder
    @Getter
    public static class ComponentInfo {
        private String type;
        private String title;
        private String quantity;
        private String roleAndEffect;
        private String artConcept;
    }
}