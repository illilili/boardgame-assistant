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

    // FastAPI 요청 DTO는 그대로 유지
    private record FastApiRuleRequest(String theme, String playerCount, double averageWeight, String ideaText,
                                      String mechanics, String storyline, String world_setting, String world_tone,
                                      String mainGoal, String subGoals, String winConditionType,
                                      String objective_designNote) {}

    @Transactional
    public GameRuleResponse generateRules(GameRuleRequest request) {
        // 1. 필수 엔티티 조회
        Long conceptId = (long) request.conceptId();
        BoardgameConcept concept = conceptRepository.findById(conceptId)
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + conceptId));

        GameObjective objective = objectiveRepository.findById(conceptId)
                .orElseThrow(() -> new EntityNotFoundException("게임 목표가 먼저 생성되어야 합니다. Concept ID: " + conceptId));

        // 2. FastAPI 요청 객체 생성 및 API 호출
        FastApiRuleRequest fastApiRequest = new FastApiRuleRequest(
                concept.getTheme(),
                concept.getPlayerCount(),
                concept.getAverageWeight(),
                concept.getIdeaText(),
                concept.getMechanics(),
                concept.getStoryline(),
                "{}", // 임시 데이터
                "",   // 임시 데이터
                objective.getMainGoal(),
                convertListToJson(objective.getSubGoals()),
                objective.getWinConditionType(),
                objective.getDesignNote()
        );

        GameRuleResponse responseFromAI = restTemplate.postForObject(ruleApiUrl, fastApiRequest, GameRuleResponse.class);
        if (responseFromAI == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 규칙 데이터를 받지 못했습니다.");
        }

        // 3. ✨ [수정된 로직] 기존 GameRule을 찾아서 업데이트하거나, 없으면 새로 생성 (Upsert)
        GameRule gameRule = ruleRepository.findById(conceptId)
                .orElseGet(() -> {
                    GameRule newRule = new GameRule();
                    // @MapsId 관계이므로, 연관 엔티티만 설정하면 JPA가 ID를 자동으로 관리합니다.
                    // newRule.setConceptId(conceptId)를 직접 호출하면 안 됩니다.
                    newRule.setBoardgameConcept(concept);
                    return newRule;
                });

        // 4. AI로부터 받은 데이터로 필드 업데이트
        gameRule.setRuleId(responseFromAI.ruleId());
        gameRule.setTurnStructure(responseFromAI.turnStructure());
        gameRule.setActionRules(responseFromAI.actionRules());
        gameRule.setVictoryCondition(responseFromAI.victoryCondition());
        gameRule.setPenaltyRules(responseFromAI.penaltyRules());
        gameRule.setDesignNote(responseFromAI.designNote());

        // 5. 저장 (JPA가 알아서 INSERT 또는 UPDATE 수행)
        ruleRepository.save(gameRule);

        return responseFromAI;
    }

    private String convertListToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            // 실제 운영 코드에서는 로깅을 추가하는 것이 좋습니다.
            return "[]";
        }
    }
}