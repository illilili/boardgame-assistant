package com.boardgame.backend_spring.content.dto;

import java.util.Map;

public class ContentSaveRequest {
    private Long planId;
    private String contentType;
    private String contentName;
    private Map<String, Object> contentData;

    public ContentSaveRequest(Long planId, String contentType, String contentName, Map<String, Object> contentData) {
        this.planId = planId;
        this.contentType = contentType;
        this.contentName = contentName;
        this.contentData = contentData;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getContentName() { return contentName; }
    public void setContentName(String contentName) { this.contentName = contentName; }
    public Map<String, Object> getContentData() { return contentData; }
    public void setContentData(Map<String, Object> contentData) { this.contentData = contentData; }
}
