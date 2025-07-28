
package com.boardgame.backend_spring.content.dto;

public class ThumbnailGenerationRequest {
    private Long planId;
    private String theme;
    private String style;


    public ThumbnailGenerationRequest(Long planId, String theme, String style) {
        this.planId = planId;
        this.theme = theme;
        this.style = style;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
}
