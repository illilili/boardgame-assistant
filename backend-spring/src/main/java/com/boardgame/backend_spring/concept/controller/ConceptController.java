package com.boardgame.backend_spring.concept.controller;


import com.boardgame.backend_spring.concept.dto.ConceptRequestDto;
import com.boardgame.backend_spring.concept.dto.ConceptResponseDto;
import com.boardgame.backend_spring.concept.service.ConceptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans") // API 경로 설정
@RequiredArgsConstructor
// React 개발 서버(localhost:3000)에서의 요청을 허용 (CORS 설정)
@CrossOrigin(origins = "http://localhost:3000")
public class ConceptController {

    private final ConceptService conceptService;

    @PostMapping("/generate-concept")
    public ResponseEntity<ConceptResponseDto> generateConcept(@RequestBody ConceptRequestDto requestDto) {
        ConceptResponseDto responseDto = conceptService.generateConcept(requestDto);
        return ResponseEntity.ok(responseDto);
    }
}