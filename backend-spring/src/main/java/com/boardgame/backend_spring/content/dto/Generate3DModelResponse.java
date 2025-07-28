package com.boardgame.backend_spring.content.dto;

public class Generate3DModelResponse {
    private Long modelId;
    private String previewUrl;
    private String refinedUrl;
    private String status;

    public Generate3DModelResponse(Long modelId, String previewUrl, String refinedUrl, String status) {
        this.modelId = modelId;
        this.previewUrl = previewUrl;
        this.refinedUrl = refinedUrl;
        this.status = status;
    }

    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }
    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }
    public String getRefinedUrl() { return refinedUrl; }
    public void setRefinedUrl(String refinedUrl) { this.refinedUrl = refinedUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
