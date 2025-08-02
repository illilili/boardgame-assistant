package com.boardgame.backend_spring.balance.dto;



import java.util.List;

import java.util.Map;



/** 시뮬레이션 기능 관련 DTO */

public class BalanceSimulationDto {

    public record Request(int ruleId, List<String> playerNames, int maxTurns, boolean enablePenalty) {}

    public record Response(List<GameSimulationResult> simulationHistory) {}

    public record GameSimulationResult(int gameId, List<TurnLog> turns, String winner, int totalTurns, String victoryCondition, int durationMinutes, Map<String, Integer> score) {}

    public record TurnLog(int turn, List<ActionLog> actions) {}

    public record ActionLog(String player, String action, String details, String rationale) {}

}