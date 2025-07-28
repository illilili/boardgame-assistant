package com.boardgame.backend_spring.copyright.dto;

public class PlanCopyrightCheckRequest {
    private Long planId;

    public PlanCopyrightCheckRequest(Long planId) {
         this.planId = planId; 
        }
    public Long getPlanId() {
         return planId; 
        }
    public void setPlanId(Long planId) {
         this.planId = planId; 
        }
}

