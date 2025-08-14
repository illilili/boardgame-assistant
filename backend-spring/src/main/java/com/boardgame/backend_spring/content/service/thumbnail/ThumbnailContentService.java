package com.boardgame.backend_spring.content.service.thumbnail;

import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateRequest;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateResponse;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailPreviewDto;

public interface ThumbnailContentService {
    ThumbnailGenerateResponse generateThumbnail(Long contentId);
    ThumbnailPreviewDto getThumbnailPreview(Long contentId);
}