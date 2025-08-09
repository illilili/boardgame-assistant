// BalanceService.java
package com.boardgame.backend_spring.balance.service;

import com.boardgame.backend_spring.balance.dto.BalanceAnalysisDto;
import com.boardgame.backend_spring.balance.dto.BalanceFastApiDto;
import com.boardgame.backend_spring.balance.dto.BalanceSimulationDto;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.rule.entity.GameRule;
import com.boardgame.backend_spring.rule.repository.GameRuleRepository;
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
public class BalanceService {


    private final RestTemplate restTemplate;
    private final GameRuleRepository gameRuleRepository;
    private final BoardgameConceptRepository conceptRepository;

    @Value("${fastapi.service.url}/api/balance/simulate")
    private String simulationApiUrl;

    @Value("${fastapi.service.url}/api/balance/analyze")
    private String balanceApiUrl;

    /**
     * [신규 추가] projectId로 규칙 목록 조회
     */
    public List<BalanceAnalysisDto.RuleInfo> getRulesByProjectId(Long projectId) {
        List<BoardgameConcept> concepts = conceptRepository.findByProjectId(projectId);

        return concepts.stream()
                .map(concept -> gameRuleRepository.findByBoardgameConcept(concept).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(this::mapToRuleInfo)
                .collect(Collectors.toList());
    }

    @Transactional
    public BalanceSimulationDto.Response runSimulation(BalanceSimulationDto.Request request) {
        GameRule rule = findRuleById(request.ruleId());
        BalanceFastApiDto.GameRuleDetails ruleDetails = mapToRuleDetails(rule);
        BalanceFastApiDto.SimulationRequest fastApiRequest = BalanceFastApiDto.SimulationRequest.builder()
                .rules(ruleDetails)
                .playerNames(request.playerNames())
                .maxTurns(request.maxTurns())
                .enablePenalty(request.enablePenalty())
                .build();
        try {
            return restTemplate.postForObject(simulationApiUrl, fastApiRequest, BalanceSimulationDto.Response.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 시뮬레이션 서비스 호출에 실패했습니다: " + e.getMessage());
        }
    }


    @Transactional
    public BalanceAnalysisDto.Response analyzeBalance(BalanceAnalysisDto.Request request) {
        GameRule rule = findRuleById(request.ruleId());
        BalanceFastApiDto.GameRuleDetails ruleDetails = mapToRuleDetails(rule);
        BalanceFastApiDto.AnalysisRequest fastApiRequest = BalanceFastApiDto.AnalysisRequest.builder()
                .rules(ruleDetails)
                .build();
        try {
            return restTemplate.postForObject(balanceApiUrl, fastApiRequest, BalanceAnalysisDto.Response.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 밸런스 분석 서비스 호출에 실패했습니다: " + e.getMessage());
        }
    }

    private GameRule findRuleById(int ruleId) {
        return gameRuleRepository.findByRuleId(ruleId)
                .orElseThrow(() -> new EntityNotFoundException("Rule ID " + ruleId + "에 해당하는 규칙을 찾을 수 없습니다."));
    }

    private BalanceAnalysisDto.RuleInfo mapToRuleInfo(GameRule rule) {
        String gameName = (rule.getBoardgameConcept() != null && rule.getBoardgameConcept().getTheme() != null)
                ? rule.getBoardgameConcept().getTheme()
                : "이름 없는 게임";
        return new BalanceAnalysisDto.RuleInfo(rule.getRuleId(), gameName);
    }


    private BalanceFastApiDto.GameRuleDetails mapToRuleDetails(GameRule rule) {
        String gameName = (rule.getBoardgameConcept() != null && rule.getBoardgameConcept().getTheme() != null)
                ? rule.getBoardgameConcept().getTheme()
                : "이름 없는 게임";

        return BalanceFastApiDto.GameRuleDetails.builder()
                .ruleId(rule.getRuleId())
                .gameName(gameName)
                .turnStructure(rule.getTurnStructure())
                .actionRules(rule.getActionRules())
                .victoryCondition(rule.getVictoryCondition())
                .penaltyRules(rule.getPenaltyRules())
                .build();
    }
}