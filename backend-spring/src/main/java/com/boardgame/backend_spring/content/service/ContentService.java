package com.boardgame.backend_spring.content.service;

import com.boardgame.backend_spring.content.dto.*;

public interface ContentService {
    void deleteContent(Long contentId);
    ContentDetailResponse getContentDetail(Long contentId);
    ContentSaveResponse saveContent(ContentSaveRequest request);
    ContentSubmitResponse submitContent(ContentSubmitRequest request);
    TextGenerateResponse generateText(TextGenerateRequest request);
    ImageGenerateResponse generateImage(ImageGenerateRequest request);
    RulebookGenerateResponse generateRulebook(RulebookGenerateRequest request);
    DescriptionScriptResponse generateDescriptionScript(DescriptionScriptRequest request);
    Generate3DModelResponse generate3DModel(Generate3DModelRequest request);
    ThumbnailGenerationResponse generateThumbnail(ThumbnailGenerationRequest request);
}
