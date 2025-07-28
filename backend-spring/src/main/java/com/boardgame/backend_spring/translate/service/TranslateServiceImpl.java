package com.boardgame.backend_spring.translate.service;

import com.boardgame.backend_spring.translate.dto.*;
import org.springframework.stereotype.Service;
import java.util.Arrays;

@Service
public class TranslateServiceImpl implements TranslateService {
    @Override
    public TranslationResponse requestTranslation(TranslationRequest request) {
        // 더미 응답
        return new TranslationResponse(155L, "pending_review");
    }

    @Override
    public TranslateResultResponse getTranslateResult(Long contentId) {
        // 더미 응답
        TranslateResultResponse.TranslatedText en = new TranslateResultResponse.TranslatedText("en", "You can skip a turn using this card.");
        TranslateResultResponse.TranslatedText ja = new TranslateResultResponse.TranslatedText("ja", "このカードを使ってターンをスキップできます。");
        return new TranslateResultResponse(contentId, "당신은 이 카드를 사용해 턴을 건너뛸 수 있습니다.", Arrays.asList(en, ja));
    }

    @Override
    public TranslationReviewResponse reviewTranslation(TranslationReviewRequest request) {
        // 더미 응답
        String status = "approve".equals(request.getResult()) ? "approved" : "rejected";
        return new TranslationReviewResponse(request.getTranslatedContentId(), status);
    }
}
