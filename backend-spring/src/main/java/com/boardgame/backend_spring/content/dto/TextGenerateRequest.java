package com.boardgame.backend_spring.content.dto;

public class TextGenerateRequest {
    private Long planId;
    private String contentType;
    private String style;


    public TextGenerateRequest(Long planId, String contentType, String style) {
        this.planId = planId;
        this.contentType = contentType;
        this.style = style;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
}
