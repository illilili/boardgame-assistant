package com.boardgame.backend_spring.content.controller;

import com.boardgame.backend_spring.content.dto.card.CardImageResponse;
import com.boardgame.backend_spring.content.dto.card.CardTextGenerateRequest;
import com.boardgame.backend_spring.content.dto.card.CardTextResponse;
import com.boardgame.backend_spring.content.dto.model3d.Model3DUserRequest;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelResponse;
import com.boardgame.backend_spring.content.service.card.CardContentService;

import com.boardgame.backend_spring.content.service.model3d.Model3dContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final CardContentService contentService;
    private final Model3dContentService model3dContentService;

    /**
     * 단일 카드 텍스트 자동 생성 요청
     * @param request CardTextGenerateRequest
     * @return 생성된 카드 텍스트
     */
    @PostMapping("/generate-text")
    public ResponseEntity<CardTextResponse> generateCardText(@RequestBody CardTextGenerateRequest request) {
        return ResponseEntity.ok(contentService.generateText(request));
    }

    @PostMapping("/generate-image")
    public ResponseEntity<CardImageResponse> generateCardImage(@RequestBody CardTextGenerateRequest request) {
        return ResponseEntity.ok(contentService.generateImage(request));
    }

    @PostMapping("/generate-3d")
    public ResponseEntity<Generate3DModelResponse> generate3DModel(@RequestBody Model3DUserRequest request) {
        return ResponseEntity.ok(model3dContentService.generate3DModel(request));
    }
}