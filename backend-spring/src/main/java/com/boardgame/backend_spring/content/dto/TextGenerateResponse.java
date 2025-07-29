package com.boardgame.backend_spring.content.dto;

import java.util.List;

public class TextGenerateResponse {
    private Long planId;
    private String contentType;
    private List<GeneratedText> generatedTexts;

    public static class GeneratedText {
        private Long textId;
        private String title;
        private String text;

        public GeneratedText(Long textId, String title, String text) {
            this.textId = textId;
            this.title = title;
            this.text = text;
        }
        public Long getTextId() { return textId; }
        public void setTextId(Long textId) { this.textId = textId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }
    public TextGenerateResponse(){
        
    }
    public TextGenerateResponse(Long planId, String contentType, List<GeneratedText> generatedTexts) {
        this.planId = planId;
        this.contentType = contentType;
        this.generatedTexts = generatedTexts;
    }
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public List<GeneratedText> getGeneratedTexts() { return generatedTexts; }
    public void setGeneratedTexts(List<GeneratedText> generatedTexts) { this.generatedTexts = generatedTexts; }
}
