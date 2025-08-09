package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.plan.dto.PlanDetailResponse;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans/approved")
@RequiredArgsConstructor
public class PlanApprovalController {

    private final PlanRepository planRepository;

    @GetMapping("/{projectId}")
    public ResponseEntity<PlanDetailResponse> getApprovedPlan(@PathVariable Long projectId) {
        Plan plan = planRepository.findByProjectIdAndStatus(projectId, PlanStatus.APPROVED)
                .orElseThrow(() -> new EntityNotFoundException("승인된 기획안이 존재하지 않습니다."));

        PlanDetailResponse response = PlanDetailResponse.builder()
                .planId(plan.getPlanId())
                .currentContent(plan.getCurrentContent())
                .planDocUrl(plan.getPlanDocUrl())
                .status(plan.getStatus())
                .build();

        return ResponseEntity.ok(response);
    }
}
