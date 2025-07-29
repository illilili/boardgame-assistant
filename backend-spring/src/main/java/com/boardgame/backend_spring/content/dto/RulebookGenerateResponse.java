package com.boardgame.backend_spring.content.dto;
import java.time.LocalDateTime;

public class RulebookGenerateResponse {
    
    private String rulebookTitle;
    private String pdfUrl;
    private LocalDateTime generatedAt;

    public RulebookGenerateResponse(String rulebookTitle, String pdfUrl, LocalDateTime generatedAt) {
        this.rulebookTitle = rulebookTitle;
        this.pdfUrl = pdfUrl;
        this.generatedAt = generatedAt;
    }

    public String getRulebookTitle() { return rulebookTitle; }
    public void setRulebookTitle(String rulebookTitle) { this.rulebookTitle = rulebookTitle; }
    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
