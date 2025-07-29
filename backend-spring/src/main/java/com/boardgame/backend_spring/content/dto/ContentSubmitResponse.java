package com.boardgame.backend_spring.content.dto;

public class ContentSubmitResponse {
    private Long contentId;
    private String status;
    private String message;

    public ContentSubmitResponse() {}

    public ContentSubmitResponse(Long contentId, String status, String message) {
        this.contentId = contentId;
        this.status = status;
        this.message = message;
    }

    public Long getContentId() { return contentId; }
    public void setContentId(Long contentId) { this.contentId = contentId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
