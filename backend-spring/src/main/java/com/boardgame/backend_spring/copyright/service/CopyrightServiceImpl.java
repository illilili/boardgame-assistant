package com.boardgame.backend_spring.copyright.service;

import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckResponse;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckResponse;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

@Service
public class CopyrightServiceImpl implements CopyrightService {
    @Override
    public ContentCopyrightCheckResponse checkContentCopyright(ContentCopyrightCheckRequest request) {
        // 더미 응답 (실제 저작권 검사 로직 필요)
        return new ContentCopyrightCheckResponse(5.7f, true, Collections.emptyList());
    }

    @Override
    public PlanCopyrightCheckResponse checkPlanCopyright(PlanCopyrightCheckRequest request) {
        // README 예시와 동일한 더미 응답 반환
        PlanCopyrightCheckResponse response = new PlanCopyrightCheckResponse();
        response.setPlanId(request.getPlanId());
        response.setRiskLevel("LOW");
        List<PlanCopyrightCheckResponse.SimilarGame> similarGames = new ArrayList<>();
        PlanCopyrightCheckResponse.SimilarGame game = new PlanCopyrightCheckResponse.SimilarGame();
        game.setTitle("Time Lords: The Board Game");
        game.setSimilarityScore(0.72);
        game.setOverlappingElements(Arrays.asList("시간여행", "유물 수집", "턴 기반 자원관리"));
        game.setBggLink("https://boardgamegeek.com/boardgame/123456");
        similarGames.add(game);
        response.setSimilarGames(similarGames);
        response.setAnalysisSummary("해당 기획안은 일부 인기 보드게임과 유사한 테마(시간여행, 유물 수집)를 공유하지만, 게임 방식과 구성 요소는 독창적으로 판단됩니다.");
        return response;
    }
}