package com.boardgame.backend_spring.rule.service;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.goal.repository.GameObjectiveRepository;
import com.boardgame.backend_spring.rule.dto.GameRuleRequest;
import com.boardgame.backend_spring.rule.dto.GameRuleResponse;
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

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GameRuleService {

    private final RestTemplate restTemplate;
    private final BoardgameConceptRepository conceptRepository;
    private final GameObjectiveRepository objectiveRepository;
    private final GameRuleRepository ruleRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${fastapi.service.url}/api/plans/generate-rule")
    private String ruleApiUrl;

    private record FastApiRuleRequest(String theme, String playerCount, double averageWeight, String ideaText,
                                      String mechanics, String storyline, String world_setting, String world_tone,
                                      String mainGoal, String subGoals, String winConditionType,
                                      String objective_designNote) {}

    @Transactional
    public GameRuleResponse generateRules(GameRuleRequest request) {
        BoardgameConcept concept = conceptRepository.findById((long) request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + request.conceptId()));

        GameObjective objective = objectiveRepository.findById((long) request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("게임 목표가 먼저 생성되어야 합니다. Concept ID: " + request.conceptId()));

        FastApiRuleRequest fastApiRequest = new FastApiRuleRequest(
                concept.getTheme(),
                concept.getPlayerCount(),
                concept.getAverageWeight(),
                concept.getIdeaText(),
                concept.getMechanics(),
                concept.getStoryline(),
                "{}",
                "",
                objective.getMainGoal(),
                convertListToJson(objective.getSubGoals()),
                objective.getWinConditionType(),
                objective.getDesignNote()
        );

        GameRuleResponse responseFromAI = restTemplate.postForObject(ruleApiUrl, fastApiRequest, GameRuleResponse.class);
        if (responseFromAI == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 규칙 데이터를 받지 못했습니다.");
        }

        Optional<GameRule> existingRule = ruleRepository.findById(concept.getConceptId());
        GameRule gameRule;

        if (existingRule.isPresent()) {
            gameRule = existingRule.get();
            // 🚨 [수정] 기존 컬렉션을 명시적으로 비우고 새 데이터로 채웁니다.
            gameRule.getActionRules().clear();
            gameRule.getActionRules().addAll(responseFromAI.actionRules());
            gameRule.getPenaltyRules().clear();
            gameRule.getPenaltyRules().addAll(responseFromAI.penaltyRules());
        } else {
            gameRule = new GameRule();
            gameRule.setConceptId(concept.getConceptId());
            gameRule.setBoardgameConcept(concept);
            gameRule.setActionRules(responseFromAI.actionRules());
            gameRule.setPenaltyRules(responseFromAI.penaltyRules());
        }

        gameRule.setRuleId(responseFromAI.ruleId());
        gameRule.setTurnStructure(responseFromAI.turnStructure());
        gameRule.setVictoryCondition(responseFromAI.victoryCondition());
        gameRule.setDesignNote(responseFromAI.designNote());

        ruleRepository.save(gameRule);

        return responseFromAI;
    }

    private String convertListToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}