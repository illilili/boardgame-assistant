package com.boardgame.backend_spring.goal.service;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.goal.dto.GameObjectiveRequest;
import com.boardgame.backend_spring.goal.dto.GameObjectiveResponse;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.goal.repository.GameObjectiveRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class GameObjectiveService {

    private final RestTemplate restTemplate;
    private final BoardgameConceptRepository conceptRepository;
    private final GameObjectiveRepository objectiveRepository;

    @Value("${fastapi.service.url}/api/plans/generate-goal")
    private String fastApiUrl;

    // FastAPI에 보낼 요청 DTO (내부용)
    private record FastApiGoalRequest(String theme, String playerCount, double averageWeight, String ideaText, String mechanics, String storyline, String world_setting, String world_tone) {}

    @Transactional
    public GameObjectiveResponse generateGoal(GameObjectiveRequest request) {
        // 1. DB에서 원본 컨셉 조회
        BoardgameConcept concept = conceptRepository.findById((long) request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("컨셉을 찾을 수 없습니다: " + request.conceptId()));

        // 2. FastAPI에 보낼 요청 객체 생성 (임시로 world_setting, world_tone은 하드코딩)
        FastApiGoalRequest fastApiRequest = new FastApiGoalRequest(
                concept.getTheme(),
                concept.getPlayerCount(),
                concept.getAverageWeight(),
                concept.getIdeaText(),
                concept.getMechanics(),
                concept.getStoryline(),
                "임시 세계관 설정", // TODO: 실제 데이터로 교체 필요
                "임시 세계관 톤"    // TODO: 실제 데이터로 교체 필요
        );

        // 3. FastAPI 호출
        GameObjectiveResponse responseFromAI;
        try {
            responseFromAI = restTemplate.postForObject(fastApiUrl, fastApiRequest, GameObjectiveResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 서비스 호출에 실패했습니다: " + e.getMessage());
        }
        if (responseFromAI == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 응답을 받지 못했습니다.");
        }

        // 4. 받은 응답을 DB에 저장 (수정된 로직)
        // conceptId로 기존 objective를 찾고, 없으면 concept과 연결된 새 객체를 생성합니다.
        GameObjective objective = objectiveRepository.findById(concept.getConceptId())
                .orElseGet(() -> {
                    GameObjective newObjective = new GameObjective();
                    // @MapsId 관계에서는 연관 객체만 설정해주면 JPA가 ID를 자동으로 관리합니다.
                    // 절대로 newObjective.setConceptId(...)를 호출하면 안 됩니다.
                    newObjective.setBoardgameConcept(concept);
                    return newObjective;
                });

        // AI로부터 받은 데이터로 objective 필드 업데이트
        objective.setMainGoal(responseFromAI.mainGoal());
        objective.setSubGoals(responseFromAI.subGoals());
        objective.setWinConditionType(responseFromAI.winConditionType());
        objective.setDesignNote(responseFromAI.designNote());

        // JPA가 새 엔티티는 INSERT, 기존 엔티티는 UPDATE를 자동으로 수행합니다.
        objectiveRepository.save(objective);

        return responseFromAI;
    }
}