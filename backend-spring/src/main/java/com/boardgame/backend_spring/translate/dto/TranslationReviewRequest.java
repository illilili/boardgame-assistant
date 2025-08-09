package com.boardgame.backend_spring.translate.dto;

public class TranslationReviewRequest {
    private Long translatedContentId;
    private String result;
    private String feedback;

    public TranslationReviewRequest() {}
    public TranslationReviewRequest(Long translatedContentId, String result, String feedback) {
        this.translatedContentId = translatedContentId;
        this.result = result;
        this.feedback = feedback;
    }
    public Long getTranslatedContentId() { return translatedContentId; }
    public void setTranslatedContentId(Long translatedContentId) { this.translatedContentId = translatedContentId; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
