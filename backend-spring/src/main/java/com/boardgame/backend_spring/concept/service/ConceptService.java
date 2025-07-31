package com.boardgame.backend_spring.concept.service;

import com.boardgame.backend_spring.concept.dto.ConceptRequestDto;
import com.boardgame.backend_spring.concept.dto.ConceptResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ConceptService {

    private final RestTemplate restTemplate;

    // application.properties에서 설정한 FastAPI URL 주입
    @Value("${fastapi.service.url}"+"/api/plans/generate-concept")
    private String fastapiUrl;

    public ConceptResponseDto generateConcept(ConceptRequestDto requestDto) {
        // FastAPI 서버에 POST 요청을 보내고 응답을 ConceptResponseDto 객체로 받음
        try {
            return restTemplate.postForObject(fastapiUrl, requestDto, ConceptResponseDto.class);
        } catch (Exception e) {
            System.err.println("FastAPI 호출 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("AI 서비스 호출에 실패했습니다.");
        }
    }
}