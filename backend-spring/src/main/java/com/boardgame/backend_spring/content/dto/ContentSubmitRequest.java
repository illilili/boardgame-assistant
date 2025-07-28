package com.boardgame.backend_spring.content.dto;

public class ContentSubmitRequest {
    private Long contentId;
    private Long submitterId;
    private String message;

    public ContentSubmitRequest(Long contentId, Long submitterId, String message) {
        this.contentId = contentId;
        this.submitterId = submitterId;
        this.message = message;
    }

    public Long getContentId() { return contentId; }
    public void setContentId(Long contentId) { this.contentId = contentId; }
    public Long getSubmitterId() { return submitterId; }
    public void setSubmitterId(Long submitterId) { this.submitterId = submitterId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
