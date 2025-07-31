package com.boardgame.backend_spring.regenerate.dto;

import java.util.List;

public class RegenerateDto {

    // 1. Concept Regeneration DTOs
    public record ConceptRequest(int conceptId, int planId, String feedback) {}
    public record ConceptResponse(int conceptId, int planId, String theme, String playerCount, double averageWeight, String ideaText, String mechanics, String storyline, String createdAt) {}

    // 2. Components Regeneration DTOs
    public record ComponentsRequest(int componentId, String feedback) {}
    public record ComponentsResponse(int componentId, List<ComponentItem> components) {}
    public record ComponentItem(String type, String name, String effect, String visualType) {}

    // 3. Rule Regeneration DTOs
    public record RuleRequest(int ruleId, String feedback) {}
    public record RuleResponse(int ruleId, String turnStructure, List<String> actionRules, String victoryCondition, List<String> penaltyRules, String designNote) {}
}