package com.boardgame.backend_spring.translate.service;

import com.boardgame.backend_spring.translate.dto.*;

public interface TranslateService {
    TranslationResponse requestTranslation(TranslationRequest request);
    TranslateResultResponse getTranslateResult(Long contentId);
    TranslationReviewResponse reviewTranslation(TranslationReviewRequest request);
}
