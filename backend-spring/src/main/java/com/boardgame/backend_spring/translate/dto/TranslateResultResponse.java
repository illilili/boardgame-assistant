package com.boardgame.backend_spring.translate.dto;

import java.util.List;

public class TranslateResultResponse {
    private Long contentId;
    private String originalText;
    private List<TranslatedText> translatedTexts;

    public static class TranslatedText {
        private String language;
        private String text;
        public TranslatedText() {}
        public TranslatedText(String language, String text) {
            this.language = language;
            this.text = text;
        }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public TranslateResultResponse() {}
    public TranslateResultResponse(Long contentId, String originalText, List<TranslatedText> translatedTexts) {
        this.contentId = contentId;
        this.originalText = originalText;
        this.translatedTexts = translatedTexts;
    }
    public Long getContentId() { return contentId; }
    public void setContentId(Long contentId) { this.contentId = contentId; }
    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }
    public List<TranslatedText> getTranslatedTexts() { return translatedTexts; }
    public void setTranslatedTexts(List<TranslatedText> translatedTexts) { this.translatedTexts = translatedTexts; }
}
