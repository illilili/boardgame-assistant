package com.boardgame.backend_spring.balance.dto;

import java.util.List;

public class BalanceDto {

    public record FeedbackResponse(
            BalanceAnalysis balanceAnalysis
    ) {}

    public record BalanceAnalysis(
            String simulationSummary,
            List<String> issuesDetected,
            List<String> recommendations,
            double balanceScore
    ) {}
}