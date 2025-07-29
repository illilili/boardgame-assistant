package com.boardgame.backend_spring.pricing.dto;

public class PricingEstimateResponse {
    private int estimatedCost;
    private int suggestedPrice;
    private double marginRate;

    public PricingEstimateResponse() {}
    public PricingEstimateResponse(int estimatedCost, int suggestedPrice, double marginRate) {
        this.estimatedCost = estimatedCost;
        this.suggestedPrice = suggestedPrice;
        this.marginRate = marginRate;
    }
    public int getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(int estimatedCost) { this.estimatedCost = estimatedCost; }
    public int getSuggestedPrice() { return suggestedPrice; }
    public void setSuggestedPrice(int suggestedPrice) { this.suggestedPrice = suggestedPrice; }
    public double getMarginRate() { return marginRate; }
    public void setMarginRate(double marginRate) { this.marginRate = marginRate; }
}
