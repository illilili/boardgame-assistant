package com.boardgame.backend_spring.content.service.card.impl;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.content.dto.card.CardTextGenerateRequest;
import com.boardgame.backend_spring.content.dto.card.CardTextRequest;
import com.boardgame.backend_spring.content.dto.card.CardTextResponse;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.service.card.CardContentService;
import com.boardgame.backend_spring.content.service.PythonApiService;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.content.dto.card.CardImageResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CardContentServiceImpl implements CardContentService {

    private final PythonApiService pythonApiService;
    private final ContentRepository contentRepository;
    private final ComponentRepository componentRepository;
    private final PlanRepository planRepository;
    private final SubTaskRepository subTaskRepository;

    // 공통 메서드: 콘텐츠, 플랜 정보 가져오기
    private Plan getPlanFromContentId(Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));
        Component component = content.getComponent();
        BoardgameConcept concept = component.getBoardgameConcept();
        return planRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new IllegalArgumentException("해당 컨셉에 연결된 기획안이 없습니다."));
    }

    @Override
    public CardTextResponse generateText(CardTextGenerateRequest request) {
        Plan plan = getPlanFromContentId(request.getContentId());

        // 상태 변경: IN_PROGRESS
        SubTask subTask = subTaskRepository.findByContentId(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);

        CardTextRequest.Card card = new CardTextRequest.Card();
        card.setContentId(request.getContentId());
        card.setName(request.getName());
        card.setEffect(request.getEffect());
        card.setDescription(request.getDescription());

        CardTextRequest aiRequest = new CardTextRequest();
        aiRequest.setPlanId(plan.getPlanId());
        aiRequest.setTheme(plan.getBoardgameConcept().getTheme());
        aiRequest.setStoryline(plan.getBoardgameConcept().getStoryline());
        aiRequest.setCards(List.of(card));

        // 생성 결과 받기
        CardTextResponse response = pythonApiService.generateText(aiRequest);
        String generatedText = response.getGeneratedTexts().get(0).getText();

        // 콘텐츠 업데이트 및 저장
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));
        content.setContentData(generatedText); // 저장
        contentRepository.save(content);       // 반영

        return response;
    }

    @Override
    public CardImageResponse generateImage(CardTextGenerateRequest request) {
        Plan plan = getPlanFromContentId(request.getContentId());

        // 상태 변경: IN_PROGRESS
        SubTask subTask = subTaskRepository.findByContentId(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);

        CardTextRequest.Card card = new CardTextRequest.Card();
        card.setContentId(request.getContentId());
        card.setName(request.getName());
        card.setEffect(request.getEffect());
        card.setDescription(request.getDescription());

        CardTextRequest aiRequest = new CardTextRequest();
        aiRequest.setPlanId(plan.getPlanId());
        aiRequest.setTheme(plan.getBoardgameConcept().getTheme());
        aiRequest.setStoryline(plan.getBoardgameConcept().getStoryline());
        aiRequest.setCards(List.of(card));

        // FastAPI 호출
        CardImageResponse response = pythonApiService.generateImage(aiRequest);
        String imageUrl = response.getGeneratedImages().get(0).getImageUrl();

        // DB 저장
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));
        content.setContentData(imageUrl); // 이미지 URL 저장
        contentRepository.save(content);  // DB 반영

        return response;
    }
}
