package com.boardgame.backend_spring.rule.service;


import com.boardgame.backend_spring.rule.dto.GameRuleRequest;
import com.boardgame.backend_spring.rule.dto.GameRuleResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GameRuleService {

    private final RestTemplate restTemplate;

    @Value("${fastapi.service.url}/api/plans/generate-rule")
    private String ruleApiUrl;

    @Autowired
    public GameRuleService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public GameRuleResponse generateRules(GameRuleRequest request) {
        try {
            return restTemplate.postForObject(ruleApiUrl, request, GameRuleResponse.class);
        } catch (Exception e) {
            System.err.println("FastAPI 규칙 생성 호출 중 오류: " + e.getMessage());
            throw new RuntimeException("AI 규칙 생성 서비스 호출에 실패했습니다.");
        }
    }
}