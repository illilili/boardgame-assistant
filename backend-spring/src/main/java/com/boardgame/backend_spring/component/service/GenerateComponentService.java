package com.boardgame.backend_spring.component.service;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import com.boardgame.backend_spring.component.dto.RegenerateComponentDto;
import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.goal.repository.GameObjectiveRepository;
import com.boardgame.backend_spring.rule.entity.GameRule;
import com.boardgame.backend_spring.rule.repository.GameRuleRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenerateComponentService {

    private final RestTemplate restTemplate;
    private final BoardgameConceptRepository conceptRepository;
    private final GameObjectiveRepository objectiveRepository;
    private final GameRuleRepository ruleRepository;
    private final ComponentRepository componentRepository;
    private final ObjectMapper objectMapper;
    private final ComponentStatusService componentStatusService;
    private final ContentRepository contentRepository;

    @Value("${fastapi.service.url}/api/plans/generate-components")
    private String fastapiGenerateComponentsUrl;

    @Value("${fastapi.service.url}/api/plans/regenerate-components")
    private String fastapiRegenerateComponentsUrl;

    @Transactional
    public GenerateComponentDto.Response generateComponents(GenerateComponentDto.Request request) {
        BoardgameConcept concept = conceptRepository.findById(request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + request.conceptId()));
        GameObjective objective = objectiveRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new EntityNotFoundException("게임 목표가 먼저 생성되어야 합니다."));
        GameRule rule = ruleRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new EntityNotFoundException("게임 규칙이 먼저 생성되어야 합니다."));

        componentRepository.deleteAllByBoardgameConcept(concept);
        componentRepository.flush();

        GenerateComponentDto.FastApiRequest fastApiRequest = GenerateComponentDto.FastApiRequest.builder()
                .theme(concept.getTheme())
                .ideaText(concept.getIdeaText())
                .mechanics(concept.getMechanics())
                .mainGoal(objective.getMainGoal())
                .turnStructure(rule.getTurnStructure())
                .actionRules(rule.getActionRules())
                .build();

        GenerateComponentDto.FastApiResponse responseFromAI = restTemplate.postForObject(
                fastapiGenerateComponentsUrl, fastApiRequest, GenerateComponentDto.FastApiResponse.class);

        if (responseFromAI == null || responseFromAI.components() == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 구성요소 데이터를 받지 못했습니다.");
        }

        List<Component> savedComponents = saveComponents(concept, responseFromAI.components());

        List<GenerateComponentDto.ComponentDetail> componentDetails = savedComponents.stream()
                .map(GenerateComponentDto.ComponentDetail::fromEntity)
                .collect(Collectors.toList());

        return new GenerateComponentDto.Response(componentDetails);
    }

    @Transactional
    public GenerateComponentDto.Response regenerateComponents(RegenerateComponentDto.Request request) {
        BoardgameConcept concept = conceptRepository.findById(request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + request.conceptId()));
        GameObjective objective = objectiveRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new EntityNotFoundException("게임 목표가 먼저 생성되어야 합니다."));
        GameRule rule = ruleRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new EntityNotFoundException("게임 규칙이 먼저 생성되어야 합니다."));
        List<Component> existingComponents = componentRepository.findByBoardgameConcept(concept);

        if (existingComponents.isEmpty()) {
            throw new IllegalStateException("재생성할 기존 구성요소가 없습니다. 먼저 구성요소를 생성해주세요.");
        }

        String currentComponentsJson = convertComponentsToJson(existingComponents);

        RegenerateComponentDto.FastApiRequest fastApiRequest = RegenerateComponentDto.FastApiRequest.builder()
                .currentComponentsJson(currentComponentsJson)
                .feedback(request.feedback())
                .theme(concept.getTheme())
                .playerCount(concept.getPlayerCount())
                .averageWeight(concept.getAverageWeight())
                .ideaText(concept.getIdeaText())
                .mechanics(concept.getMechanics())
                .storyline(concept.getStoryline())
                .mainGoal(objective.getMainGoal())
                .winConditionType(objective.getWinConditionType())
                .worldSetting("임시 세계관 설정")
                .worldTone("임시 세계관 톤")
                .build();

        GenerateComponentDto.FastApiResponse responseFromAI = restTemplate.postForObject(
                fastapiRegenerateComponentsUrl, fastApiRequest, GenerateComponentDto.FastApiResponse.class);

        if (responseFromAI == null || responseFromAI.components() == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 구성요소 데이터를 받지 못했습니다.");
        }

        componentRepository.deleteAllByBoardgameConcept(concept);
        componentRepository.flush();

        List<Component> savedComponents = saveComponents(concept, responseFromAI.components());

        return new GenerateComponentDto.Response(
                savedComponents.stream()
                        .map(GenerateComponentDto.ComponentDetail::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    private List<Component> saveComponents(BoardgameConcept concept, List<GenerateComponentDto.FastApiComponentItem> items) {
        List<Component> savedComponents = new ArrayList<>();
        for (GenerateComponentDto.FastApiComponentItem item : items) {
            Component newComponent = new Component();
            newComponent.setBoardgameConcept(concept);
            newComponent.setTitle(item.getTitle());
            newComponent.setType(item.getType());
            newComponent.setQuantity(item.getQuantity());
            newComponent.setRoleAndEffect(item.getRoleAndEffect());
            newComponent.setArtConcept(item.getArtConcept());
            newComponent.setInterconnection(item.getInterconnection());

            // ✨ 변경점: 단순화된 SubTask 생성 로직 호출
            List<SubTask> subTasks = createSubTasksForComponent(newComponent);
            newComponent.setSubTasks(subTasks);

            componentStatusService.recalcAndSave(newComponent);

            savedComponents.add(componentRepository.save(newComponent));
        }
        return savedComponents;
    }

    private String convertComponentsToJson(List<Component> components) {
        List<GenerateComponentDto.FastApiComponentItem> list = components.stream()
                .map(c -> {
                    GenerateComponentDto.FastApiComponentItem item = new GenerateComponentDto.FastApiComponentItem();
                    item.setType(c.getType());
                    item.setTitle(c.getTitle());
                    item.setQuantity(c.getQuantity());
                    item.setRoleAndEffect(c.getRoleAndEffect());
                    item.setArtConcept(c.getArtConcept());
                    item.setInterconnection(c.getInterconnection());
                    return item;
                }).collect(Collectors.toList());
        try {
            return objectMapper.writeValueAsString(java.util.Map.of("components", list));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("기존 구성요소를 JSON으로 변환하는 데 실패했습니다.", e);
        }
    }

    // 🚨 [수정] 메서드 시그니처와 내부 로직을 대폭 단순화합니다.
    private List<SubTask> createSubTasksForComponent(Component component) {
        List<SubTask> tasks = new ArrayList<>();
        String type = component.getType().toLowerCase();

        // Component의 타입에 따라 필요한 SubTask만 생성합니다.
        if (type.contains("card")) {
            // 카드 한 장은 'text'와 'image' 작업을 가집니다.
            tasks.add(createSubTaskWithContent(component, "text"));
            tasks.add(createSubTaskWithContent(component, "image"));
        } else if (type.contains("token") || type.contains("pawn") || type.contains("miniature") || type.contains("figure") || type.contains("dice")) {
            tasks.add(createSubTaskWithContent(component, "3d_model"));
        } else if (type.contains("board") || type.contains("mat") || type.contains("image")) {
            tasks.add(createSubTaskWithContent(component, "image"));
        } else { // 룰북, 게임 박스 등
            tasks.add(createSubTaskWithContent(component, "text"));
        }
        return tasks;
    }

    // 🚨 [수정] `example` 파라미터를 제거하고 Content 저장 로직을 단순화합니다.
    private SubTask createSubTaskWithContent(Component component, String subTaskType) {
        Content content = new Content();
        content.setComponent(component);
        content.setContentType(subTaskType);
        content.setCreatedAt(LocalDateTime.now());
        // `name`과 `effect` 필드는 Content 엔티티에서 제거되었으므로 값을 설정하지 않습니다.

        Content savedContent = contentRepository.save(content);

        SubTask task = new SubTask();
        task.setComponent(component);
        task.setType(subTaskType);
        task.setStatus("NOT_STARTED");
        task.setContentId(savedContent.getContentId());

        return task;
    }
}