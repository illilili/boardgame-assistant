package com.boardgame.backend_spring.content.dto;

public class ThumbnailGenerationResponse {
    private Long thumbnailId;
    private String thumbnailUrl;

    // 기본 생성자 추가
    public ThumbnailGenerationResponse() {
    }

    public ThumbnailGenerationResponse(Long thumbnailId, String thumbnailUrl) {
        this.thumbnailId = thumbnailId;
        this.thumbnailUrl = thumbnailUrl;
    }

    public Long getThumbnailId() { return thumbnailId; }
    public void setThumbnailId(Long thumbnailId) { this.thumbnailId = thumbnailId; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
}
