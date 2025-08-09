// 파일: component/service/GenerateComponentService.java
package com.boardgame.backend_spring.component.service;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import com.boardgame.backend_spring.component.dto.RegenerateComponentDto;
import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
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

    @Value("${fastapi.service.url}/api/plans/generate-components")
    private String fastapiGenerateComponentsUrl;

    @Value("${fastapi.service.url}/api/plans/regenerate-components")
    private String fastapiRegenerateComponentsUrl;

    @Transactional
    public GenerateComponentDto.Response generateComponents(GenerateComponentDto.Request request) {
        // 1. conceptId로 모든 정보 조회
        BoardgameConcept concept = conceptRepository.findById(request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + request.conceptId()));
        GameObjective objective = objectiveRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new EntityNotFoundException("게임 목표가 먼저 생성되어야 합니다."));
        GameRule rule = ruleRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new EntityNotFoundException("게임 규칙이 먼저 생성되어야 합니다."));

        // 🚨 기존 컴포넌트가 있다면 모두 삭제
        componentRepository.deleteAllByBoardgameConcept(concept);
        componentRepository.flush();

        // 2. FastAPI 요청 DTO 생성
        GenerateComponentDto.FastApiRequest fastApiRequest = GenerateComponentDto.FastApiRequest.builder()
                .theme(concept.getTheme())
                .ideaText(concept.getIdeaText())
                .mechanics(concept.getMechanics())
                .mainGoal(objective.getMainGoal())
                .turnStructure(rule.getTurnStructure())
                .actionRules(rule.getActionRules())
                .build();

        // 3. FastAPI 호출
        GenerateComponentDto.FastApiResponse responseFromAI = restTemplate.postForObject(
                fastapiGenerateComponentsUrl, fastApiRequest, GenerateComponentDto.FastApiResponse.class);

        if (responseFromAI == null || responseFromAI.components() == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 구성요소 데이터를 받지 못했습니다.");
        }

        // 4. 받은 상세 데이터를 DB에 저장
        List<Component> savedComponents = saveComponents(concept, responseFromAI.components());

        // 5. 최종 응답 DTO로 변환
        List<GenerateComponentDto.ComponentDetail> componentDetails = savedComponents.stream()
                .map(GenerateComponentDto.ComponentDetail::fromEntity)
                .collect(Collectors.toList());

        return new GenerateComponentDto.Response(componentDetails);
    }

    @Transactional
    public GenerateComponentDto.Response regenerateComponents(RegenerateComponentDto.Request request) {
        // 1. conceptId로 모든 관련 정보 조회
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

        // 2. 기존 구성요소 목록을 JSON 문자열로 변환
        String currentComponentsJson = convertComponentsToJson(existingComponents);

        // 3. FastAPI 요청 DTO 생성
        RegenerateComponentDto.FastApiRequest fastApiRequest = RegenerateComponentDto.FastApiRequest.builder()
                .currentComponentsJson(currentComponentsJson)
                .feedback(request.feedback())
                .theme(concept.getTheme())
                .playerCount(concept.getPlayerCount())
                .averageWeight(concept.getAverageWeight())
                .ideaText(concept.getIdeaText())
                .mechanics(concept.getMechanics())
                .mainGoal(objective.getMainGoal())
                .winConditionType(objective.getWinConditionType())
                .worldSetting("임시 세계관 설정") // TODO: 추후 World 엔티티에서 가져오도록 확장
                .worldTone("임시 세계관 톤")      // TODO: 추후 World 엔티티에서 가져오도록 확장
                .build();

        // 4. FastAPI 호출
        GenerateComponentDto.FastApiResponse responseFromAI = restTemplate.postForObject(
                fastapiRegenerateComponentsUrl, fastApiRequest, GenerateComponentDto.FastApiResponse.class);

        if (responseFromAI == null || responseFromAI.components() == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 구성요소 데이터를 받지 못했습니다.");
        }

        // 5. 기존 구성요소 및 하위 작업(SubTask) 삭제
        componentRepository.deleteAllByBoardgameConcept(concept);
        componentRepository.flush();

        // 6. 새로 받은 데이터로 DB에 저장
        List<Component> savedComponents = saveComponents(concept, responseFromAI.components());

        // 7. 최종 응답 DTO로 변환하여 반환
        return new GenerateComponentDto.Response(
                savedComponents.stream()
                        .map(GenerateComponentDto.ComponentDetail::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    // 재사용 가능한 컴포넌트 저장 로직
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

            List<SubTask> subTasks = createSubTasksForComponent(newComponent);
            newComponent.setSubTasks(subTasks);

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

    private List<SubTask> createSubTasksForComponent(Component component) {
        List<SubTask> tasks = new ArrayList<>();
        String type = component.getType().toLowerCase();
        if (type.contains("card")) {
            tasks.add(createSubTask(component, "text", "NOT_STARTED"));
            tasks.add(createSubTask(component, "image", "NOT_STARTED"));
        } else if (type.contains("token") || type.contains("pawn") || type.contains("miniature")) {
            tasks.add(createSubTask(component, "3d_model", "NOT_STARTED"));
        } else if (type.contains("board") || type.contains("mat")) {
            tasks.add(createSubTask(component, "image", "NOT_STARTED"));
        } else {
            tasks.add(createSubTask(component, "text", "NOT_STARTED"));
        }
        return tasks;
    }

    private SubTask createSubTask(Component component, String type, String status) {
        SubTask task = new SubTask();
        task.setComponent(component);
        task.setType(type);
        task.setStatus(status);
        return task;
    }
}