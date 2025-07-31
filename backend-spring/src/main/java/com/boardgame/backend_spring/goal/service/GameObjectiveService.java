package com.boardgame.backend_spring.goal.service;

import com.boardgame.backend_spring.goal.dto.GameObjectiveRequest;
import com.boardgame.backend_spring.goal.dto.GameObjectiveResponse;
// import lombok.RequiredArgsConstructor; // <- 이 줄을 삭제하거나 주석 처리
import org.springframework.beans.factory.annotation.Autowired; // Autowired 추가
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
// @RequiredArgsConstructor // <- 이 어노테이션을 삭제!
public class GameObjectiveService {

    private final RestTemplate restTemplate;

    @Value("${fastapi.service.url}/api/plans/generate-goal")
    private String fastApiUrl;

    // 생성자 직접 추가
    @Autowired
    public GameObjectiveService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public GameObjectiveResponse generateGoal(GameObjectiveRequest request) {
        try {
            return restTemplate.postForObject(fastApiUrl, request, GameObjectiveResponse.class);
        } catch (Exception e) {
            System.err.println("FastAPI 호출 중 오류가 발생했습니다: " + e.getMessage());
            throw new RuntimeException("AI 서비스 호출에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
}