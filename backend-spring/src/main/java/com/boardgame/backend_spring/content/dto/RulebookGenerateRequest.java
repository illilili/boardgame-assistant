package com.boardgame.backend_spring.content.dto;

public class RulebookGenerateRequest {
    
    private Long planId;

    public RulebookGenerateRequest(Long planId) {
        this.planId = planId;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
}
