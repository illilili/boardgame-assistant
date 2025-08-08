package com.boardgame.backend_spring.copyright.dto;

import java.util.List;

public class PlanCopyrightCheckResponse {
    private Long planId;
    private String riskLevel;
    private List<SimilarGame> similarGames;
    private String analysisSummary;

    public static class SimilarGame {
        private String title;
        private double similarityScore;
        private List<String> overlappingElements;
        private String bggLink;

        public SimilarGame() {}
        public SimilarGame(String title, double similarityScore, List<String> overlappingElements, String bggLink) {
            this.title = title;
            this.similarityScore = similarityScore;
            this.overlappingElements = overlappingElements;
            this.bggLink = bggLink;
        }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public double getSimilarityScore() { return similarityScore; }
        public void setSimilarityScore(double similarityScore) { this.similarityScore = similarityScore; }
        public List<String> getOverlappingElements() { return overlappingElements; }
        public void setOverlappingElements(List<String> overlappingElements) { this.overlappingElements = overlappingElements; }
        public String getBggLink() { return bggLink; }
        public void setBggLink(String bggLink) { this.bggLink = bggLink; }
    }

    public PlanCopyrightCheckResponse() {}
    public PlanCopyrightCheckResponse(Long planId, String riskLevel, List<SimilarGame> similarGames, String analysisSummary) {
        this.planId = planId;
        this.riskLevel = riskLevel;
        this.similarGames = similarGames;
        this.analysisSummary = analysisSummary;
    }
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public List<SimilarGame> getSimilarGames() { return similarGames; }
    public void setSimilarGames(List<SimilarGame> similarGames) { this.similarGames = similarGames; }
    public String getAnalysisSummary() { return analysisSummary; }
    public void setAnalysisSummary(String analysisSummary) { this.analysisSummary = analysisSummary; }
}
