package com.boardgame.backend_spring.regenerate.dto;

import java.util.List;

public class RegenerateDto {

    // 1. Concept Regeneration DTOs
    // 클라이언트로부터 받는 요청 DTO
    public record ConceptRequest(int conceptId, int planId, String feedback) {}

    // 클라이언트에 보낼 최종 응답 DTO
    public record ConceptResponse(long conceptId, long planId, String theme, String playerCount, double averageWeight, String ideaText, String mechanics, String storyline, String createdAt) {}


    // [추가] FastAPI에 요청을 보낼 때 사용할 내부 DTO
    public record FastApiRegenRequest(OriginalConcept originalConcept, String feedback) {}
    public record OriginalConcept(long conceptId, long planId, String theme, String playerCount, double averageWeight, String ideaText, String mechanics, String storyline, String createdAt) {}


    // 2. Components Regeneration DTOs
    public record ComponentsRequest(int componentId, String feedback) {}
    public record ComponentsResponse(int componentId, List<ComponentItem> components) {}
    public record ComponentItem(String type, String name, String effect, String visualType) {}

}