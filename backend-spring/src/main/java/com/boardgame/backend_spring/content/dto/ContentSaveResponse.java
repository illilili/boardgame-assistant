package com.boardgame.backend_spring.content.dto;

public class ContentSaveResponse {
    private Long contentId;
    private String message;

    public ContentSaveResponse(Long contentId, String message) {
        this.contentId = contentId;
        this.message = message;
    }

    public Long getContentId() { return contentId; }
    public void setContentId(Long contentId) { this.contentId = contentId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
