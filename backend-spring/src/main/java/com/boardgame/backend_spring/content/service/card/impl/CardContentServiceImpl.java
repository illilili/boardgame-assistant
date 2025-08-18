package com.boardgame.backend_spring.content.service.card.impl;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.content.dto.card.*;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.service.card.CardContentService;
import com.boardgame.backend_spring.content.service.PythonApiService;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.component.service.ComponentStatusService;

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
    private final ComponentStatusService componentStatusService;

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

        SubTask subTask = subTaskRepository.findByContentId(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);
        componentStatusService.recalcAndSave(subTask.getComponent());

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

        CardTextResponse response = pythonApiService.generateText(aiRequest);
        String generatedText = response.getGeneratedTexts().get(0).getText();

        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));
        content.setContentData(generatedText);
        contentRepository.save(content);

        return response;
    }

    @Override
    public CardImageResponse generateImage(CardTextGenerateRequest request) {
        Plan plan = getPlanFromContentId(request.getContentId());

        SubTask subTask = subTaskRepository.findByContentId(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);
        componentStatusService.recalcAndSave(subTask.getComponent());

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

        CardImageResponse response = pythonApiService.generateImage(aiRequest);
        String imageUrl = response.getGeneratedImages().get(0).getImageUrl();

        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));
        content.setContentData(imageUrl);
        contentRepository.save(content);

        return response;
    }

    @Override
    public CardPreviewDto getCardPreview(Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        Component component = content.getComponent();
        BoardgameConcept concept = component.getBoardgameConcept();

        CardPreviewDto dto = new CardPreviewDto();
        dto.setContentId(contentId);

        // 🚨 [수정 완료] 개별 카드(Content)의 정보가 있으면 우선적으로 사용하고, 없으면 상위 Component의 정보를 사용
        dto.setName(
                content.getName() != null && !content.getName().isEmpty()
                        ? content.getName() : component.getTitle()
        );
        dto.setEffect(
                content.getEffect() != null && !content.getEffect().isEmpty()
                        ? content.getEffect() : component.getRoleAndEffect()
        );
        dto.setDescription(
                content.getDescription() != null && !content.getDescription().isEmpty()
                        ? content.getDescription() : component.getArtConcept()
        );

        dto.setTheme(concept.getTheme());
        dto.setStoryline(concept.getStoryline());

        return dto;
    }
}