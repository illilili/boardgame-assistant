// src/main/java/com/boardgame/backend_spring/rule/service/GameRuleService.java
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
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 처리를 위해 추가

    @Value("${fastapi.service.url}/api/plans/generate-rule")
    private String ruleApiUrl;

    // FastAPI에 보낼 요청 DTO (내부용)
    private record FastApiRuleRequest(String theme, String playerCount, double averageWeight, String ideaText,
                                      String mechanics, String storyline, String world_setting, String world_tone,
                                      String mainGoal, String subGoals, String winConditionType,
                                      String objective_designNote) {}

    @Transactional
    public GameRuleResponse generateRules(GameRuleRequest request) {
        // 1. DB에서 원본 컨셉 조회
        BoardgameConcept concept = conceptRepository.findById((long) request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + request.conceptId()));

        // 2. 컨셉에 연결된 목표(Goal) 정보 조회
        GameObjective objective = objectiveRepository.findById((long) request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("게임 목표가 먼저 생성되어야 합니다. Concept ID: " + request.conceptId()));

        // 3. FastAPI에 보낼 요청 객체 생성
        // 현재 World 데이터가 없으므로 임시 값으로 채웁니다.
        FastApiRuleRequest fastApiRequest = new FastApiRuleRequest(
                concept.getTheme(),
                concept.getPlayerCount(),
                concept.getAverageWeight(),
                concept.getIdeaText(),
                concept.getMechanics(),
                concept.getStoryline(),
                "{}", // world_setting 임시 값
                "",   // world_tone 임시 값
                objective.getMainGoal(),
                convertListToJson(objective.getSubGoals()), // subGoals를 JSON 문자열로 변환
                objective.getWinConditionType(),
                objective.getDesignNote()
        );

        // 4. FastAPI 호출
        GameRuleResponse responseFromAI = restTemplate.postForObject(ruleApiUrl, fastApiRequest, GameRuleResponse.class);
        if (responseFromAI == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 규칙 데이터를 받지 못했습니다.");
        }

        // 5. 받은 응답을 GameRule 엔티티로 변환 및 저장
        GameRule gameRule = ruleRepository.findById(concept.getConceptId()).orElse(new GameRule());
        gameRule.setBoardgameConcept(concept);
        gameRule.setRuleId(responseFromAI.ruleId());
        gameRule.setTurnStructure(responseFromAI.turnStructure());
        gameRule.setActionRules(responseFromAI.actionRules());
        gameRule.setVictoryCondition(responseFromAI.victoryCondition());
        gameRule.setPenaltyRules(responseFromAI.penaltyRules());
        gameRule.setDesignNote(responseFromAI.designNote());

        ruleRepository.save(gameRule);

        return responseFromAI;
    }

    // List<String>을 JSON 배열 형태의 문자열로 변환하는 헬퍼 메소드
    private String convertListToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}