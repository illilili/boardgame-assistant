package com.boardgame.backend_spring.content.controller;

import com.boardgame.backend_spring.content.dto.card.CardPreviewDto;
import com.boardgame.backend_spring.content.dto.model3d.Model3DPreviewDto;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailPreviewDto;
import com.boardgame.backend_spring.content.service.card.CardContentService;
import com.boardgame.backend_spring.content.service.model3d.Model3dContentService;
import com.boardgame.backend_spring.content.service.thumbnail.ThumbnailContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class PreviewController {

    private final CardContentService cardContentService;
    private final Model3dContentService model3dContentService;
    private final ThumbnailContentService thumbnailContentService;

    /**
     * 카드 콘텐츠 미리보기 (텍스트/이미지)
     */
    @GetMapping("/{contentId}/preview/card")
    public ResponseEntity<CardPreviewDto> getCardPreview(@PathVariable Long contentId) {
        return ResponseEntity.ok(cardContentService.getCardPreview(contentId));
    }

    /**
     * 3D 콘텐츠 미리보기
     */
    @GetMapping("/{contentId}/preview/3d")
    public ResponseEntity<Model3DPreviewDto> getModel3DPreview(@PathVariable Long contentId) {
        return ResponseEntity.ok(model3dContentService.getModel3DPreview(contentId));
    }

    /**
     * 썸네일 콘텐츠 미리보기
     */
    @GetMapping("/{contentId}/preview/thumbnail")
    public ResponseEntity<ThumbnailPreviewDto> getThumbnailPreview(@PathVariable Long contentId) {
        return ResponseEntity.ok(thumbnailContentService.getThumbnailPreview(contentId));
    }
}
