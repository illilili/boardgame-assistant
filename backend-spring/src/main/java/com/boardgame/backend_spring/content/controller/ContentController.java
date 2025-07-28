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

    @GetMapping("/{contentId}")
    public ContentDetailResponse getContentDetail(@PathVariable Long contentId) {
        return contentService.getContentDetail(contentId);
    }

    @PostMapping("/version/save")
    public ContentSaveResponse saveContent(@RequestBody ContentSaveRequest request) {
        return contentService.saveContent(request);
    }

    @PostMapping("/submit")
    public ContentSubmitResponse submitContent(@RequestBody ContentSubmitRequest request) {
        return contentService.submitContent(request);
    }
}
