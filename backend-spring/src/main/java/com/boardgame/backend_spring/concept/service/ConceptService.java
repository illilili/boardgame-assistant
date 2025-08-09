// `ConceptService.java`
package com.boardgame.backend_spring.concept.service;

import com.boardgame.backend_spring.concept.dto.ConceptRequestDto;
import com.boardgame.backend_spring.concept.dto.ConceptResponseDto;
import com.boardgame.backend_spring.concept.dto.RegenerateConceptRequestDto;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
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
public class ConceptService {

    private final RestTemplate restTemplate;
    private final BoardgameConceptRepository boardgameConceptRepository;
    private final ProjectRepository projectRepository; // 🚨 ProjectRepository 주입

    @Value("${fastapi.service.url}/api/plans/generate-concept")
    private String generateConceptUrl;

    @Value("${fastapi.service.url}/api/plans/regenerate-concept")
    private String regenerateConceptUrl;

    @Transactional
    public ConceptResponseDto generateConcept(ConceptRequestDto requestDto) {
        ConceptResponseDto responseFromFastAPI;
        try {
            responseFromFastAPI = restTemplate.postForObject(generateConceptUrl, requestDto, ConceptResponseDto.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 서비스 호출에 실패했습니다: " + e.getMessage());
        }

        if (responseFromFastAPI == null) {
            throw new RuntimeException("AI 서비스로부터 유효한 응답을 받지 못했습니다.");
        }

        // 🚨 project 엔티티 조회
        Project project = projectRepository.findById(requestDto.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + requestDto.getProjectId()));

        BoardgameConcept newConcept = new BoardgameConcept();
        newConcept.setPlanId(responseFromFastAPI.getPlanId());
        newConcept.setTheme(responseFromFastAPI.getTheme());
        newConcept.setPlayerCount(responseFromFastAPI.getPlayerCount());
        newConcept.setAverageWeight(responseFromFastAPI.getAverageWeight());
        newConcept.setIdeaText(responseFromFastAPI.getIdeaText());
        newConcept.setMechanics(responseFromFastAPI.getMechanics());
        newConcept.setStoryline(responseFromFastAPI.getStoryline());
        newConcept.setCreatedAt(responseFromFastAPI.getCreatedAt());
        newConcept.setProject(project); // 🚨 조회한 project 엔티티를 설정

        BoardgameConcept savedConcept = boardgameConceptRepository.save(newConcept);

        return mapEntityToDto(savedConcept);
    }

    @Transactional
    public ConceptResponseDto regenerateConcept(RegenerateConceptRequestDto requestDto) {
        ConceptResponseDto regeneratedConceptDto;
        try {
            regeneratedConceptDto = restTemplate.postForObject(regenerateConceptUrl, requestDto, ConceptResponseDto.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 재생성 서비스 호출에 실패했습니다: " + e.getMessage());
        }

        if (regeneratedConceptDto == null) {
            throw new RuntimeException("AI 재생성 서비스로부터 유효한 응답을 받지 못했습니다.");
        }

        Long planId = regeneratedConceptDto.getPlanId();
        BoardgameConcept existingConcept = boardgameConceptRepository.findByPlanId(planId)
                .orElseThrow(() -> new EntityNotFoundException("해당 planId를 가진 컨셉을 찾을 수 없습니다: " + planId));

        existingConcept.setTheme(regeneratedConceptDto.getTheme());
        existingConcept.setPlayerCount(regeneratedConceptDto.getPlayerCount());
        existingConcept.setAverageWeight(regeneratedConceptDto.getAverageWeight());
        existingConcept.setIdeaText(regeneratedConceptDto.getIdeaText());
        existingConcept.setMechanics(regeneratedConceptDto.getMechanics());
        existingConcept.setStoryline(regeneratedConceptDto.getStoryline());
        existingConcept.setCreatedAt(regeneratedConceptDto.getCreatedAt());

        BoardgameConcept updatedConcept = boardgameConceptRepository.save(existingConcept);

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
        dto.setProjectId(entity.getProject().getId());
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