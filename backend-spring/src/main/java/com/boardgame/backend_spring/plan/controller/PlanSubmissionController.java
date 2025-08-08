package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.plan.dto.PlanDetailResponse;
import com.boardgame.backend_spring.plan.dto.PlanSubmitRequest;
import com.boardgame.backend_spring.plan.dto.PlanSubmitResponse;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.plan.service.PlanSubmissionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanSubmissionController {

    private final PlanSubmissionService submissionService;
    private final PlanRepository planRepository;

    @PostMapping(value = "/{planId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlanSubmitResponse> submitPlan(
            @PathVariable Long planId,
            @RequestPart("file") MultipartFile file) throws IOException {

        Plan plan = submissionService.submitPlan(planId, file);

        PlanSubmitResponse response = PlanSubmitResponse.builder()
                .planId(plan.getPlanId())
                .planDocUrl(plan.getPlanDocUrl())
                .status(plan.getStatus())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{planId}")
    public ResponseEntity<PlanDetailResponse> getPlanDetail(@PathVariable Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with id: " + planId));

        PlanDetailResponse response = PlanDetailResponse.builder()
                .planId(plan.getPlanId())
                .currentContent(plan.getCurrentContent())
                .planDocUrl(plan.getPlanDocUrl())
                .status(plan.getStatus())
                .build();

        return ResponseEntity.ok(response);
    }
}
