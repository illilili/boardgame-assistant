package com.boardgame.backend_spring.balance.dto;

import java.util.List;
import java.util.Map;

// API 요청/응답을 위한 DTO들을 모아놓은 클래스
public class SimulationDto {

    // === 요청(Request) DTO ===
    public record SimulateRequest(
            int ruleId,
            List<String> playerNames,
            int maxTurns,
            boolean enablePenalty
    ) {}

    // === 응답(Response) DTO ===
    public record SimulateResponse(
            List<GameSimulationResult> simulationHistory
    ) {}

    public record GameSimulationResult(
            int gameId,
            List<TurnLog> turns,
            String winner,
            int totalTurns,
            String victoryCondition,
            int durationMinutes,
            Map<String, Integer> score
    ) {}

    public record TurnLog(
            int turn,
            List<ActionLog> actions
    ) {}

    public record ActionLog(
            String player,
            String action,
            String details,
            String rationale
    ) {}
}