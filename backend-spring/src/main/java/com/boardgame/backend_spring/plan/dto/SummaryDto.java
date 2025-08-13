package com.boardgame.backend_spring.plan.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/** 기획서 생성 기능 관련 DTO */
public class SummaryDto {

    // React -> Spring 기획서 생성 요청 DTO
    @Getter
    @NoArgsConstructor // JSON 역직렬화를 위해 기본 생성자 추가
    public static class Request {
        private Long conceptId;
    }

    // Spring -> React 기획서 생성 응답 DTO
    @Getter
    @Builder
    public static class GenerateResponse {
        private Long planId;
        private String summaryText;
        private String planDocUrl; // 기획안 문서 url 추가
    }

    // React에 컨셉 목록을 보내주기 위한 DTO
    @Getter
    @Builder
    public static class ConceptListInfo {
        private Long conceptId;
        private String theme;
        private Long projectId; // 🚨 projectId 추가
    }

    // Spring -> FastAPI 요청 DTO
    @Builder
    @Getter
    public static class FastApiRequest {
        private String gameName;
        private ConceptInfo concept;
        private GoalInfo goal;
        private RuleInfo rule;
        private List<ComponentInfo> components;
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
        private String victoryCondition;
    }

    @Builder
    @Getter
    public static class ComponentInfo {
        private String title;
        private String role_and_effect;
    }
}