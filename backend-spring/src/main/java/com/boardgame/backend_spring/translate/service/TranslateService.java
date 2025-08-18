package com.boardgame.backend_spring.translate.service;

import com.boardgame.backend_spring.translate.dto.*;

import java.util.List;

/**
 * 번역 서비스 인터페이스
 */
public interface TranslateService {

    /** 퍼블리셔가 번역 요청 (같은 언어 재요청 가능, iteration 증가) */
    TranslationResponse requestTranslations(Long publisherUserId, TranslationRequest dto);

    /** contentId 기준 전체 번역 히스토리 조회 */
    List<TranslationItemDto> getTranslationsByContent(Long contentId);

    /** FastAPI 콜백 처리 (COMPLETED/FAILED) */
    TranslationItemDto handleCallback(TranslationCallbackRequest cb);

    /** FastAPI 연동 훅 (실제 HTTP 호출은 추후 구현) */
    void dispatchToFastApi(Long translationId);

    TranslationItemDto completeTranslation(Long translationId);
    List<TranslationItemDto> getTranslationsByContent(Long contentId, boolean latestOnly);

    List<TranslationCandidateDto> listTranslationCandidates(Long projectId);
}
