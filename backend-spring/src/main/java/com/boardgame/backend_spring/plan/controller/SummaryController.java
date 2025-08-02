package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.plan.dto.SummaryDto;
import com.boardgame.backend_spring.plan.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    /**
     * [신규 추가] 프론트엔드에서 사용할 컨셉 목록을 제공하는 API
     */
    @GetMapping("/concepts-for-summary")
    public ResponseEntity<List<SummaryDto.ConceptListInfo>> getConceptListForSummary() {
        return ResponseEntity.ok(summaryService.getConceptList());
    }

    @PostMapping("/generate-summary")
    public ResponseEntity<String> generateSummary(@RequestBody SummaryDto.Request request) {
        String document = summaryService.generateSummaryDocument(request.getConceptId());
        return ResponseEntity.ok(document);
    }
}