package com.boardgame.backend_spring.translate.controller;

import com.boardgame.backend_spring.translate.dto.*;
import com.boardgame.backend_spring.translate.service.TranslateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 퍼블리셔 번역 관련 API
 * (JWT/권한체크 제거, 테스트용)
 */
@RestController
@RequestMapping("/api/translate")
@RequiredArgsConstructor
public class TranslateController {

    private final TranslateService translateService;

    /**
     * [퍼블리셔] 다국어 번역 요청
     * POST /api/translate/request
     * body: TranslationRequest { contentId, targetLanguages[], feedback? }
     */
    @PostMapping("/request")
    public ResponseEntity<TranslationResponse> requestTranslation(
            @RequestBody TranslationRequest dto
    ) {
        // JWT 없이 테스트 시 publisherId를 null로 전달
        return ResponseEntity.ok(translateService.requestTranslations(null, dto));
    }



    /**
     * contentId 기준 번역 히스토리 조회
     * GET /api/translate/{contentId}
     */
    @GetMapping("/{contentId}")
    public ResponseEntity<List<TranslationItemDto>> getTranslationsByContent(
            @PathVariable Long contentId,
            @RequestParam(name = "latestOnly", defaultValue = "false") boolean latestOnly
    ) {
        return ResponseEntity.ok(translateService.getTranslationsByContent(contentId, latestOnly));
    }

    //최신 1건씩 만 조회


    /**
     * FastAPI 콜백 처리
     * POST /api/translate/callback
     */
    @PostMapping("/callback")
    public ResponseEntity<TranslationItemDto> handleCallback(
            @RequestBody TranslationCallbackRequest cb
    ) {
        return ResponseEntity.ok(translateService.handleCallback(cb));
    }


    // 완료 처리
    @PutMapping("/{translationId}/complete")
    public ResponseEntity<TranslationItemDto> complete(
            @PathVariable Long translationId
    ) {
        return ResponseEntity.ok(translateService.completeTranslation(translationId));
    }
}
