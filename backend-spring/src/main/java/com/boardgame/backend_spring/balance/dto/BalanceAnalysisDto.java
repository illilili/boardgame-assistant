package com.boardgame.backend_spring.balance.dto;



import java.util.List;



/** 밸런스 분석 기능 관련 DTO */

public class BalanceAnalysisDto {

// React -> Spring 요청

    public record Request(int ruleId) {}



// Spring -> React 응답

    public record Response(BalanceAnalysis balanceAnalysis) {}



// **[신규 추가]** 규칙 목록 조회를 위한 DTO

    public record RuleInfo(int ruleId, String gameName) {}



// 공통 모델

    public record BalanceAnalysis(String simulationSummary, List<String> issuesDetected, List<String> recommendations, double balanceScore) {}

}