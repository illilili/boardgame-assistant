// `ConceptController.java`
package com.boardgame.backend_spring.concept.controller;


import com.boardgame.backend_spring.concept.dto.ConceptRequestDto;
import com.boardgame.backend_spring.concept.dto.ConceptResponseDto;
import com.boardgame.backend_spring.concept.dto.RegenerateConceptRequestDto;
import com.boardgame.backend_spring.concept.service.ConceptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // React 앱 주소 허용
public class ConceptController {

    private final ConceptService conceptService;

    // 새로운 컨셉 생성
    @PostMapping("/generate-concept")
    public ResponseEntity<ConceptResponseDto> generateConcept(@RequestBody ConceptRequestDto requestDto) {
        ConceptResponseDto responseDto = conceptService.generateConcept(requestDto);
        return ResponseEntity.ok(responseDto);
    }

    // 기존 컨셉 재생성
    @PostMapping("/regenerate-concept")
    public ResponseEntity<ConceptResponseDto> regenerateConcept(@RequestBody RegenerateConceptRequestDto requestDto) {
        ConceptResponseDto responseDto = conceptService.regenerateConcept(requestDto);
        return ResponseEntity.ok(responseDto);
    }

    // 모든 컨셉의 '상세 정보' 목록을 반환하는 API
    @GetMapping("/concepts")
    public ResponseEntity<List<ConceptResponseDto>> getAllConcepts() {
        return ResponseEntity.ok(conceptService.getAllConcepts());
    }
}