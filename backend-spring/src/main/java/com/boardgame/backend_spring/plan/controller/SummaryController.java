package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.plan.dto.PlanDetailResponse;
import com.boardgame.backend_spring.plan.dto.PlanVersionDto;
import com.boardgame.backend_spring.plan.dto.SummaryDto;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.plan.service.SummaryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    // 기획서 생성을 위한 컨셉 목록 조회 API
    @GetMapping("/concepts-for-summary")
    public ResponseEntity<List<SummaryDto.ConceptListInfo>> getConceptListForSummary() {
        return ResponseEntity.ok(summaryService.getConceptList());
    }

    // AI 기획서 생성 API
    @PostMapping("/generate-summary")
    public ResponseEntity<SummaryDto.GenerateResponse> generateSummary(@RequestBody SummaryDto.Request request) {
        SummaryDto.GenerateResponse response = summaryService.generateSummaryDocument(request.getConceptId());
        return ResponseEntity.ok(response);
    }

    // --- 버전 관리 API ---

    // 기획서 버전 저장 API
    @PostMapping("/version/save")
    public ResponseEntity<PlanVersionDto.SaveResponse> saveVersion(@RequestBody PlanVersionDto.SaveRequest request) {
        return ResponseEntity.ok(summaryService.saveVersion(request));
    }

    // 특정 기획서의 버전 목록 조회 API
    @GetMapping("/{planId}/versions")
    public ResponseEntity<PlanVersionDto.VersionListResponse> getVersions(@PathVariable Long planId) {
        return ResponseEntity.ok(summaryService.getVersions(planId));
    }

    // 특정 버전으로 기획서 롤백 API
    @PostMapping("/{planId}/rollback")
    public ResponseEntity<PlanVersionDto.RollbackResponse> rollbackVersion(
            @PathVariable Long planId,
            @RequestBody PlanVersionDto.RollbackRequest request) {
        return ResponseEntity.ok(summaryService.rollbackVersion(planId, request.getVersionId()));
    }
}