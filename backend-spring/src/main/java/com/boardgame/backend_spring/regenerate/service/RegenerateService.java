package com.boardgame.backend_spring.regenerate.service;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.regenerate.dto.RegenerateDto;
import com.boardgame.backend_spring.rule.entity.GameRule;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // jakarta.transaction.Transactional -> org.springframework... 로 변경
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor; // [추가]

@Service
@RequiredArgsConstructor // [추가] final 필드를 위한 생성자를 자동으로 만들어줍니다.
public class RegenerateService {

    private final RestTemplate restTemplate;
    private final BoardgameConceptRepository boardgameConceptRepository;

    @Value("${fastapi.service.url}/api/plans/regenerate-concept")
    private String regenConceptApiUrl;

    @Value("${fastapi.service.url}/api/plans/regenerate-components")
    private String regenComponentsApiUrl;

    @Value("${fastapi.service.url}/api/plans/regenerate-rule")
    private String regenRuleApiUrl;

    // [수정] @RequiredArgsConstructor가 생성자를 대체하므로 수동 생성자는 삭제합니다.
    /*
    @Autowired
    public RegenerateService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    */

    public RegenerateDto.ComponentsResponse regenerateComponents(RegenerateDto.ComponentsRequest request) {
        // (변경 없음)
        return restTemplate.postForObject(regenComponentsApiUrl, request, RegenerateDto.ComponentsResponse.class);
    }

    @Transactional
    public RegenerateDto.RuleResponse regenerateRule(RegenerateDto.RuleRequest request) {
        // 1. DB에서 ruleId로 원본 규칙 조회
        GameRule originalRule = gameRuleRepository.findByRuleId((int) request.ruleId())
                .orElseThrow(() -> new EntityNotFoundException("원본 규칙을 찾을 수 없습니다. Rule ID: " + request.ruleId()));

        // 2. 원본 규칙에 연결된 컨셉과 목표 정보 조회
        BoardgameConcept concept = originalRule.getBoardgameConcept();
        GameObjective objective = gameObjectiveRepository.findById(concept.getConceptId())
                .orElseThrow(() -> new EntityNotFoundException("연관된 게임 목표를 찾을 수 없습니다. Concept ID: " + concept.getConceptId()));

        // 3. FastAPI에 보낼 요청 DTO 생성
        RegenerateDto.FastApiRegenRuleRequest fastApiRequest = new RegenerateDto.FastApiRegenRuleRequest(
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

        // 4. FastAPI에 재생성 요청
        RegenerateDto.RuleResponse regeneratedResponse = restTemplate.postForObject(regenRuleApiUrl, fastApiRequest, RegenerateDto.RuleResponse.class);
        if (regeneratedResponse == null) {
            throw new RuntimeException("AI 서비스로부터 규칙 재생성에 실패했습니다.");
        }

        // 5. DB에 있는 원본 규칙 엔티티를 새로운 정보로 업데이트
        originalRule.setTurnStructure(regeneratedResponse.turnStructure());
        originalRule.setActionRules(regeneratedResponse.actionRules());
        originalRule.setVictoryCondition(regeneratedResponse.victoryCondition());
        originalRule.setPenaltyRules(regeneratedResponse.penaltyRules());
        originalRule.setDesignNote(regeneratedResponse.designNote());
        gameRuleRepository.save(originalRule); // 변경된 내용 저장

        // 6. 최종 결과를 클라이언트에 반환
        return regeneratedResponse;
    }
}