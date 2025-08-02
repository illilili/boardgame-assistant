package com.boardgame.backend_spring.plan.service;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.goal.repository.GameObjectiveRepository;
import com.boardgame.backend_spring.rule.entity.GameRule;
import com.boardgame.backend_spring.rule.repository.GameRuleRepository;
import com.boardgame.backend_spring.plan.dto.SummaryDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SummaryService {

    private final BoardgameConceptRepository conceptRepository;
    private final GameObjectiveRepository objectiveRepository;
    private final GameRuleRepository ruleRepository;
    private final ComponentRepository componentRepository;
    private final RestTemplate restTemplate;

    @Value("${fastapi.service.url}/api/plans/generate-summary")
    private String summaryApiUrl;

    public List<SummaryDto.ConceptListInfo> getConceptList() {
        return conceptRepository.findAll().stream()
                .map(concept -> SummaryDto.ConceptListInfo.builder()
                        .conceptId(concept.getConceptId())
                        .theme(concept.getTheme())
                        .build())
                .collect(Collectors.toList());
    }

    public String generateSummaryDocument(Long conceptId) {
        BoardgameConcept concept = conceptRepository.findById(conceptId)
                .orElseThrow(() -> new EntityNotFoundException("Concept not found with id: " + conceptId));
        GameObjective objective = objectiveRepository.findByBoardgameConcept(concept).orElse(new GameObjective());
        GameRule rule = ruleRepository.findByBoardgameConcept(concept).orElse(new GameRule());
        List<Component> components = componentRepository.findByBoardgameConcept(concept);

        // [수정] DTO 빌더 호출 부분을 새로운 필드명에 맞게 변경
        SummaryDto.ConceptInfo conceptInfo = SummaryDto.ConceptInfo.builder()
                .theme(concept.getTheme()).playerCount(concept.getPlayerCount()).averageWeight(concept.getAverageWeight())
                .ideaText(concept.getIdeaText()).mechanics(concept.getMechanics()).storyline(concept.getStoryline()).build();

        SummaryDto.GoalInfo goalInfo = SummaryDto.GoalInfo.builder()
                .mainGoal(objective.getMainGoal()).subGoals(objective.getSubGoals()).winConditionType(objective.getWinConditionType()).build();

        SummaryDto.RuleInfo ruleInfo = SummaryDto.RuleInfo.builder()
                .turnStructure(rule.getTurnStructure()).actionRules(rule.getActionRules()).victoryCondition(rule.getVictoryCondition()).build();

        List<SummaryDto.ComponentInfo> componentInfoList = components.stream()
                .map(c -> SummaryDto.ComponentInfo.builder()
                        .title(c.getTitle())
                        .role_and_effect(c.getRoleAndEffect())
                        .build())
                .collect(Collectors.toList());

        SummaryDto.FastApiRequest fastApiRequest = SummaryDto.FastApiRequest.builder()
                .gameName(concept.getTheme()) // 게임 이름으로 테마 사용
                .concept(conceptInfo)
                .goal(goalInfo)
                .rule(ruleInfo)
                .components(componentInfoList)
                .build();

        try {
            // FastAPI는 이제 String이 아닌 SummaryResponse 객체를 반환한다고 가정
            return restTemplate.postForObject(summaryApiUrl, fastApiRequest, String.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 기획서 생성 서비스 호출에 실패했습니다: " + e.getMessage());
        }
    }
}