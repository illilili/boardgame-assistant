package com.boardgame.backend_spring.balance.service;

import com.boardgame.backend_spring.balance.dto.BalanceDto;
import com.boardgame.backend_spring.balance.dto.SimulationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GameSimService {

    private final RestTemplate restTemplate;

    @Value("${fastapi.service.url}/api/simulate/rule-test")
    private String simulationApiUrl;

    @Value("${fastapi.service.url}/api/feedback/balance")
    private String balanceApiUrl;

    @Autowired
    public GameSimService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // 게임 시뮬레이션 실행 로직
    public SimulationDto.SimulateResponse runSimulation(SimulationDto.SimulateRequest request) {
        try {
            return restTemplate.postForObject(simulationApiUrl, request, SimulationDto.SimulateResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 시뮬레이션 서비스 호출에 실패했습니다: " + e.getMessage());
        }
    }

    // 밸런스 분석 피드백 요청 로직
    public BalanceDto.FeedbackResponse getBalanceFeedback() {
        try {
            return restTemplate.getForObject(balanceApiUrl, BalanceDto.FeedbackResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 밸런스 분석 서비스 호출에 실패했습니다: " + e.getMessage());
        }
    }
}