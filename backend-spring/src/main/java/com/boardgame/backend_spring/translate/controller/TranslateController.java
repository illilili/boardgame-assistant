package com.boardgame.backend_spring.translate.controller;

import com.boardgame.backend_spring.translate.dto.*;
import com.boardgame.backend_spring.translate.service.TranslateService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/translate")
public class TranslateController {
    private final TranslateService translateService;

    public TranslateController(TranslateService translateService) {
        this.translateService = translateService;
    }

    @PostMapping("/request")
    public TranslationResponse requestTranslation(@RequestBody TranslationRequest request) {
        return translateService.requestTranslation(request);
    }

    @GetMapping("/{contentId}")
    public TranslateResultResponse getTranslateResult(@PathVariable Long contentId) {
        return translateService.getTranslateResult(contentId);
    }

    @PostMapping("/review")
    public TranslationReviewResponse reviewTranslation(@RequestBody TranslationReviewRequest request) {
        return translateService.reviewTranslation(request);
    }
}
