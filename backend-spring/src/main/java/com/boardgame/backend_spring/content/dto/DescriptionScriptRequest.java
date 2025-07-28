package com.boardgame.backend_spring.content.dto;

public class DescriptionScriptRequest {
    private Long planId;
    private String target;
    private String length;
    private String tone;

    public DescriptionScriptRequest() {}

    public DescriptionScriptRequest(Long planId, String target, String length, String tone) {
        this.planId = planId;
        this.target = target;
        this.length = length;
        this.tone = tone;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public String getLength() { return length; }
    public void setLength(String length) { this.length = length; }
    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }
}

