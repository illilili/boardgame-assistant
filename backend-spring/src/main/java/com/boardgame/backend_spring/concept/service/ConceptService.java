package com.boardgame.backend_spring.concept.service;

import com.boardgame.backend_spring.concept.dto.ConceptRequestDto;
import com.boardgame.backend_spring.concept.dto.ConceptResponseDto;
// [추가] 재생성 요청 DTO 임포트
import com.boardgame.backend_spring.concept.dto.RegenerateConceptRequestDto;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import jakarta.persistence.EntityNotFoundException; // [추가] 예외 처리
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConceptService {

    private final RestTemplate restTemplate;
    private final BoardgameConceptRepository boardgameConceptRepository;

    @Value("${fastapi.service.url}/api/plans/generate-concept")
    private String generateConceptUrl;

    // [추가] 재생성 API URL 프로퍼티
    @Value("${fastapi.service.url}/api/plans/regenerate-concept")
    private String regenerateConceptUrl;

    @Transactional
    public ConceptResponseDto generateConcept(ConceptRequestDto requestDto) {
        // ... (기존 generateConcept 메소드 내용은 동일)
        ConceptResponseDto responseFromFastAPI;
        try {
            responseFromFastAPI = restTemplate.postForObject(generateConceptUrl, requestDto, ConceptResponseDto.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 서비스 호출에 실패했습니다: " + e.getMessage());
        }

        if (responseFromFastAPI == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 응답을 받지 못했습니다.");
        }

        BoardgameConcept newConcept = new BoardgameConcept();
        newConcept.setPlanId(responseFromFastAPI.getPlanId());
        newConcept.setTheme(responseFromFastAPI.getTheme());
        newConcept.setPlayerCount(responseFromFastAPI.getPlayerCount());
        newConcept.setAverageWeight(responseFromFastAPI.getAverageWeight());
        newConcept.setIdeaText(responseFromFastAPI.getIdeaText());
        newConcept.setMechanics(responseFromFastAPI.getMechanics());
        newConcept.setStoryline(responseFromFastAPI.getStoryline());
        newConcept.setCreatedAt(responseFromFastAPI.getCreatedAt());

        BoardgameConcept savedConcept = boardgameConceptRepository.save(newConcept);

        return mapEntityToDto(savedConcept);
    }

    // [신규 추가] 컨셉 재생성 로직
    @Transactional
    public ConceptResponseDto regenerateConcept(RegenerateConceptRequestDto requestDto) {
        // 1. FastAPI 재생성 API 호출
        ConceptResponseDto regeneratedConceptDto;
        try {
            regeneratedConceptDto = restTemplate.postForObject(regenerateConceptUrl, requestDto, ConceptResponseDto.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 재생성 서비스 호출에 실패했습니다: " + e.getMessage());
        }

        if (regeneratedConceptDto == null) {
            throw new RuntimeException("AI 재생성 서비스로부터 유효한 응답을 받지 못했습니다.");
        }

        // 2. planId를 사용하여 기존 컨셉 엔티티를 DB에서 조회
        Long planId = regeneratedConceptDto.getPlanId();
        BoardgameConcept existingConcept = boardgameConceptRepository.findByPlanId(planId)
                .orElseThrow(() -> new EntityNotFoundException("해당 planId를 가진 컨셉을 찾을 수 없습니다: " + planId));

        // 3. 조회된 엔티티의 내용을 FastAPI로부터 받은 새로운 정보로 업데이트
        existingConcept.setTheme(regeneratedConceptDto.getTheme());
        existingConcept.setPlayerCount(regeneratedConceptDto.getPlayerCount());
        existingConcept.setAverageWeight(regeneratedConceptDto.getAverageWeight());
        existingConcept.setIdeaText(regeneratedConceptDto.getIdeaText());
        existingConcept.setMechanics(regeneratedConceptDto.getMechanics());
        existingConcept.setStoryline(regeneratedConceptDto.getStoryline());
        existingConcept.setCreatedAt(regeneratedConceptDto.getCreatedAt());
        // conceptId는 그대로 유지하고 planId도 동일

        // 4. 변경된 엔티티 저장 (JPA의 더티 체킹에 의해 @Transactional 어노테이션이 끝나면 자동 반영되지만, 명시적으로 save 호출도 가능)
        BoardgameConcept updatedConcept = boardgameConceptRepository.save(existingConcept);

        // 5. 업데이트된 엔티티를 DTO로 변환하여 반환
        return mapEntityToDto(updatedConcept);
    }


    public List<ConceptResponseDto> getAllConcepts() {
        return boardgameConceptRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    private ConceptResponseDto mapEntityToDto(BoardgameConcept entity) {
        ConceptResponseDto dto = new ConceptResponseDto();
        dto.setConceptId(entity.getConceptId());
        dto.setPlanId(entity.getPlanId());
        dto.setTheme(entity.getTheme());
        dto.setPlayerCount(entity.getPlayerCount());
        dto.setAverageWeight(entity.getAverageWeight());
        dto.setIdeaText(entity.getIdeaText());
        dto.setMechanics(entity.getMechanics());
        dto.setStoryline(entity.getStoryline());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}