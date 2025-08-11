package com.boardgame.backend_spring.rule.service;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.goal.repository.GameObjectiveRepository;
import com.boardgame.backend_spring.rule.dto.RegenerateRuleDto;
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

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegenerateRuleService {

    private final RestTemplate restTemplate;
    private final GameRuleRepository gameRuleRepository;
    private final GameObjectiveRepository gameObjectiveRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${fastapi.service.url}/api/plans/regenerate-rule")
    private String regenRuleApiUrl;

    @Transactional
    public RegenerateRuleDto.Response regenerateRule(RegenerateRuleDto.Request request) {
        Optional<GameRule> existingRule = gameRuleRepository.findByRuleId(request.ruleId());
        if (existingRule.isEmpty()) {
            throw new EntityNotFoundException("원본 규칙을 찾을 수 없습니다. Rule ID: " + request.ruleId());
        }
        GameRule originalRule = existingRule.get();

        BoardgameConcept concept = originalRule.getBoardgameConcept();
        GameObjective objective = gameObjectiveRepository.findById(concept.getConceptId())
                .orElseThrow(() -> new EntityNotFoundException("연관된 게임 목표를 찾을 수 없습니다. Concept ID: " + concept.getConceptId()));

        RegenerateRuleDto.FastApiRequest fastApiRequest = new RegenerateRuleDto.FastApiRequest(
                concept.getTheme(),
                concept.getMechanics(),
                objective.getMainGoal(),
                originalRule.getRuleId(),
                originalRule.getTurnStructure(),
                originalRule.getActionRules(),
                originalRule.getVictoryCondition(),
                originalRule.getPenaltyRules(),
                request.feedback()
        );

        RegenerateRuleDto.Response regeneratedResponse = restTemplate.postForObject(regenRuleApiUrl, fastApiRequest, RegenerateRuleDto.Response.class);
        if (regeneratedResponse == null) {
            throw new RuntimeException("AI 서비스로부터 규칙 재생성에 실패했습니다.");
        }

        originalRule.setRuleId(regeneratedResponse.ruleId());
        originalRule.setTurnStructure(regeneratedResponse.turnStructure());
        originalRule.setActionRules(regeneratedResponse.actionRules());
        originalRule.setVictoryCondition(regeneratedResponse.victoryCondition());
        originalRule.setPenaltyRules(regeneratedResponse.penaltyRules());
        originalRule.setDesignNote(regeneratedResponse.designNote());

        gameRuleRepository.save(originalRule);

        return regeneratedResponse;
    }
}