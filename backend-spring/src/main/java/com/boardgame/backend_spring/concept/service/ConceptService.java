package com.boardgame.backend_spring.concept.service;

import com.boardgame.backend_spring.concept.dto.ConceptRequestDto;
import com.boardgame.backend_spring.concept.dto.ConceptResponseDto;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
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
    private String fastapiUrl;

    @Transactional
    public ConceptResponseDto generateConcept(ConceptRequestDto requestDto) {
        ConceptResponseDto responseFromFastAPI;
        try {
            responseFromFastAPI = restTemplate.postForObject(fastapiUrl, requestDto, ConceptResponseDto.class);
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

    // [수정] 모든 컨셉의 '상세 정보'를 DTO 리스트로 반환하도록 변경
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