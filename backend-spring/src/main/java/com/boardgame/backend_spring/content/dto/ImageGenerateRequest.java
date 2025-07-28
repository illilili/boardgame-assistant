package com.boardgame.backend_spring.content.dto;

public class ImageGenerateRequest {
    private Long planId;
    private Long textId;
    private String contentType;
    private String style;

    public ImageGenerateRequest(Long planId, Long textId, String contentType, String style) {
        this.planId = planId;
        this.textId = textId;
        this.contentType = contentType;
        this.style = style;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public Long getTextId() { return textId; }
    public void setTextId(Long textId) { this.textId = textId; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
}
