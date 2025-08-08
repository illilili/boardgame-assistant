package com.boardgame.backend_spring.translate.dto;

public class TranslationRequest {
    private Long contentId;
    private String targetLanguage;

    public TranslationRequest() {}
    public TranslationRequest(Long contentId, String targetLanguage) {
        this.contentId = contentId;
        this.targetLanguage = targetLanguage;
    }
    public Long getContentId() { return contentId; }
    public void setContentId(Long contentId) { this.contentId = contentId; }
    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
}
