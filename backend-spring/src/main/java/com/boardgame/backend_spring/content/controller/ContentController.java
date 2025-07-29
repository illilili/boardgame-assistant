package com.boardgame.backend_spring.content.controller;

import com.boardgame.backend_spring.content.dto.*;
import com.boardgame.backend_spring.content.service.ContentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
public class ContentController {
    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }
    @DeleteMapping("/{contentId}")
    public String deleteContent(@PathVariable Long contentId) {
        contentService.deleteContent(contentId);
        return "콘텐츠가 삭제되었습니다.";
    }

    @GetMapping("/{contentId}")
    public ContentDetailResponse getContentDetail(@PathVariable Long contentId) {
        return contentService.getContentDetail(contentId);
    }

    @PostMapping("/save")
    public ContentSaveResponse saveContent(@RequestBody ContentSaveRequest request) {
    return contentService.saveContent(request);
    }

    @PostMapping("/submit")
    public ContentSubmitResponse submitContent(@RequestBody ContentSubmitRequest request) {
        return contentService.submitContent(request);
    }
    @PostMapping("/generate-text")
    public TextGenerateResponse generateText(@RequestBody TextGenerateRequest request) {
        return contentService.generateText(request);
    }

    @PostMapping("/generate-image")
    public ImageGenerateResponse generateImage(@RequestBody ImageGenerateRequest request) {
        return contentService.generateImage(request);
    }

    @PostMapping("/generate-rulebook")
    public RulebookGenerateResponse generateRulebook(@RequestBody RulebookGenerateRequest request) {
        return contentService.generateRulebook(request);
    }

    @PostMapping("/generate-description-script")
    public DescriptionScriptResponse generateDescriptionScript(@RequestBody DescriptionScriptRequest request) {
        return contentService.generateDescriptionScript(request);
    }

    @PostMapping("/generate-3d")
    public Generate3DModelResponse generate3DModel(@RequestBody Generate3DModelRequest request) {
        return contentService.generate3DModel(request);
    }

    @PostMapping("/generate-thumbnail")
    public ThumbnailGenerationResponse generateThumbnail(@RequestBody ThumbnailGenerationRequest request) {
        return contentService.generateThumbnail(request);
    }
}

