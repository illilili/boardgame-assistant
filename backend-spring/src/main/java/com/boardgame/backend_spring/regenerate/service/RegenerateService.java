package com.boardgame.backend_spring.regenerate.service;

import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.regenerate.dto.RegenerateDto;
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

    @Transactional
    public RegenerateDto.ConceptResponse regenerateConcept(RegenerateDto.ConceptRequest request) {
        // 1. DB에서 원본 컨셉 조회
        BoardgameConcept originalConceptEntity = boardgameConceptRepository.findById((long) request.conceptId())
                .orElseThrow(() -> new EntityNotFoundException("원본 컨셉을 찾을 수 없습니다. ID: " + request.conceptId()));

        // 2. FastAPI에 보낼 요청 DTO 생성
        RegenerateDto.OriginalConcept originalConceptDto = new RegenerateDto.OriginalConcept(
                originalConceptEntity.getConceptId(),
                originalConceptEntity.getPlanId(),
                originalConceptEntity.getTheme(),
                originalConceptEntity.getPlayerCount(),
                originalConceptEntity.getAverageWeight(),
                originalConceptEntity.getIdeaText(),
                originalConceptEntity.getMechanics(),
                originalConceptEntity.getStoryline(),
                originalConceptEntity.getCreatedAt()
        );
        RegenerateDto.FastApiRegenRequest fastApiRequest = new RegenerateDto.FastApiRegenRequest(originalConceptDto, request.feedback());

        // 3. FastAPI에 재생성 요청
        RegenerateDto.ConceptResponse regeneratedResponse = restTemplate.postForObject(regenConceptApiUrl, fastApiRequest, RegenerateDto.ConceptResponse.class);
        if (regeneratedResponse == null) {
            throw new RuntimeException("AI 서비스로부터 컨셉 재생성에 실패했습니다.");
        }

        // 4. 새로 받은 컨셉을 DB에 저장 (ID는 DB가 자동 생성)
        BoardgameConcept newConceptEntity = new BoardgameConcept();
        newConceptEntity.setPlanId(regeneratedResponse.planId()); // 기존 planId 유지
        newConceptEntity.setTheme(regeneratedResponse.theme());
        newConceptEntity.setPlayerCount(regeneratedResponse.playerCount());
        newConceptEntity.setAverageWeight(regeneratedResponse.averageWeight());
        newConceptEntity.setIdeaText(regeneratedResponse.ideaText());
        newConceptEntity.setMechanics(regeneratedResponse.mechanics());
        newConceptEntity.setStoryline(regeneratedResponse.storyline());
        newConceptEntity.setCreatedAt(regeneratedResponse.createdAt());

        BoardgameConcept savedEntity = boardgameConceptRepository.save(newConceptEntity);

        // 5. 최종적으로 저장된 컨셉 정보를 클라이언트에 반환
        return new RegenerateDto.ConceptResponse(
                savedEntity.getConceptId(),
                savedEntity.getPlanId(),
                savedEntity.getTheme(),
                savedEntity.getPlayerCount(),
                savedEntity.getAverageWeight(),
                savedEntity.getIdeaText(),
                savedEntity.getMechanics(),
                savedEntity.getStoryline(),
                savedEntity.getCreatedAt()
        );
    }



}