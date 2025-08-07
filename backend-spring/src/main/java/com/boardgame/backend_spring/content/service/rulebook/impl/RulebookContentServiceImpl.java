package com.boardgame.backend_spring.content.service.rulebook.impl;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookGenerateRequest;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookGenerateResponse;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookRequest;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.service.PythonApiService;
import com.boardgame.backend_spring.content.service.rulebook.RulebookContentService;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.content.dto.rulebook.ComponentDto;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.rule.entity.GameRule;
import com.boardgame.backend_spring.rule.repository.GameRuleRepository;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.component.entity.SubTask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RulebookContentServiceImpl implements RulebookContentService {

    private final PythonApiService pythonApiService;
    private final ContentRepository contentRepository;
    private final PlanRepository planRepository;
    private final GameRuleRepository gameRuleRepository;
    private final ComponentRepository componentRepository;
    private final SubTaskRepository subTaskRepository;

    @Override
    public RulebookGenerateResponse generateRulebook(RulebookGenerateRequest request) {
        // 1. 콘텐츠 찾기
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        SubTask subTask = subTaskRepository.findByContentId(content.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당 콘텐츠에 대한 SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);

        Component component = content.getComponent();
        BoardgameConcept concept = component.getBoardgameConcept();

        // 2. 기획안/규칙 찾기
        Plan plan = planRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new IllegalArgumentException("기획안이 존재하지 않습니다."));

        GameRule rule = gameRuleRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new IllegalArgumentException("게임 규칙이 존재하지 않습니다."));

        List<Component> components = componentRepository.findByBoardgameConcept(concept);
        List<ComponentDto> componentDtos = components.stream()
                .map(c -> new ComponentDto(c.getType(), c.getTitle(), c.getQuantity()))
                .toList();

        // 3. FastAPI로 보낼 DTO 구성
        RulebookRequest pythonRequest = new RulebookRequest();
        pythonRequest.setPlanId(plan.getPlanId());
        pythonRequest.setContentId(content.getId());
        pythonRequest.setTitle(concept.getProject().getName());
        pythonRequest.setTheme(concept.getTheme());
        pythonRequest.setStoryline(concept.getStoryline());
        pythonRequest.setIdea(concept.getIdeaText());
        pythonRequest.setTurnStructure(rule.getTurnStructure());
        pythonRequest.setVictoryCondition(rule.getVictoryCondition());
        pythonRequest.setActionRules(rule.getActionRules());
        pythonRequest.setPenaltyRules(rule.getPenaltyRules());
        pythonRequest.setDesignNote(rule.getDesignNote());
        pythonRequest.setComponents(componentDtos);

        // 4. FastAPI 호출
        RulebookGenerateResponse response = pythonApiService.generateRulebook(pythonRequest);

        // 5. 결과 저장
        content.setContentData(response.getRulebookText());
        contentRepository.save(content);

        return response;
    }
}
