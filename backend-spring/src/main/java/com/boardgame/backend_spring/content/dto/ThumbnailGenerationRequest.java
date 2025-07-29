
package com.boardgame.backend_spring.content.dto;

public class ThumbnailGenerationRequest {
    private Long planId;
    private String projectTitle;
    private String theme;
    private String storyline;

    // 기본 생성자 추가
    public ThumbnailGenerationRequest() {
    }

    public ThumbnailGenerationRequest(Long planId, String projectTitle, String theme, String storyline) {
        this.planId = planId;
        this.projectTitle = projectTitle;
        this.theme = theme;
        this.storyline = storyline;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    
    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }
    
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    
    public String getStoryline() { return storyline; }
    public void setStoryline(String storyline) { this.storyline = storyline; }
}
