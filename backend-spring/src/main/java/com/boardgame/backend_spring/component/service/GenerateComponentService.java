package com.boardgame.backend_spring.component.service;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.goal.repository.GameObjectiveRepository;
import com.boardgame.backend_spring.rule.entity.GameRule;
import com.boardgame.backend_spring.rule.repository.GameRuleRepository;
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

    @Value("${fastapi.service.url}/api/plans/generate-components")
    private String fastapiGenerateComponentsUrl;

    @Transactional
    public GenerateComponentDto.Response generateComponents(GenerateComponentDto.Request request) {
        // 1. conceptId로 모든 정보 조회
        BoardgameConcept concept = conceptRepository.findById(request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + request.conceptId()));
        GameObjective objective = objectiveRepository.findById(request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("게임 목표가 먼저 생성되어야 합니다."));
        GameRule rule = ruleRepository.findById(request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("게임 규칙이 먼저 생성되어야 합니다."));

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
        List<Component> savedComponents = new ArrayList<>();
        for (GenerateComponentDto.FastApiComponentItem item : responseFromAI.components()) {
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

        // 5. 최종 응답 DTO로 변환
        List<GenerateComponentDto.ComponentDetail> componentDetails = savedComponents.stream()
                .map(this::mapToComponentDetail)
                .collect(Collectors.toList());

        return new GenerateComponentDto.Response(componentDetails);
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

    private GenerateComponentDto.ComponentDetail mapToComponentDetail(Component component) {
        return GenerateComponentDto.ComponentDetail.builder()
                .componentId(component.getComponentId())
                .title(component.getTitle())
                .type(component.getType())
                .quantity(component.getQuantity())
                .roleAndEffect(component.getRoleAndEffect())
                .artConcept(component.getArtConcept())
                .interconnection(component.getInterconnection())
                .subTasks(component.getSubTasks().stream().map(subTask ->
                        GenerateComponentDto.SubTaskDetail.builder()
                                .contentId(subTask.getContentId())
                                .type(subTask.getType())
                                .status(subTask.getStatus())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}
