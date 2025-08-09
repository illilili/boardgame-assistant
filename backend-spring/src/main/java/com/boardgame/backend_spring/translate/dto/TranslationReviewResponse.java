package com.boardgame.backend_spring.translate.dto;

public class TranslationReviewResponse {
    private Long translatedContentId;
    private String status;

    public TranslationReviewResponse() {}
    public TranslationReviewResponse(Long translatedContentId, String status) {
        this.translatedContentId = translatedContentId;
        this.status = status;
    }
    public Long getTranslatedContentId() { return translatedContentId; }
    public void setTranslatedContentId(Long translatedContentId) { this.translatedContentId = translatedContentId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
