package com.boardgame.backend_spring.review.controller;

import com.boardgame.backend_spring.review.dto.*;
import com.boardgame.backend_spring.review.service.PlanReviewService;
import com.boardgame.backend_spring.review.service.ComponentReviewService;
import com.boardgame.backend_spring.review.dto.ComponentReviewDetailDto;
import com.boardgame.backend_spring.review.service.ComponentReviewQueryService;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.enumtype.ProjectStatus;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {

    private final PlanReviewService planReviewService;
    private final ComponentReviewService componentReviewService;
    private final ComponentReviewQueryService componentReviewQueryService;
    private final PlanRepository planRepository;
    private final ProjectRepository projectRepository;

    // ===== 기획안 승인/반려 =====
    @PostMapping("/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PUBLISHER')")
    public ResponseEntity<String> reviewPlan(@RequestBody ReviewPlanRequest request) {
        String message = planReviewService.reviewPlan(
                request.getPlanId(),
                request.isApprove(),
                request.getReason()
        );

        if (request.isApprove()) {
            Plan plan = planRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new EntityNotFoundException("Plan not found"));

            Project project = plan.getProject();
            if (project == null) {
                throw new EntityNotFoundException("Plan에 연결된 Project가 없습니다.");
            }
            project.setStatus(ProjectStatus.DEVELOPMENT);
            projectRepository.save(project);
        }

        return ResponseEntity.ok(message);
    }

    // ===== 제출된 기획안 목록 조회 =====
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'PUBLISHER')")
    public ResponseEntity<List<PendingPlanDto>> getPendingPlans() {
        return ResponseEntity.ok(planReviewService.getPendingPlans());
    }

    // ===== 제출된 컴포넌트 목록 조회 (기존 단일 리스트) =====
    @GetMapping("/components/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'PUBLISHER')")
    public ResponseEntity<List<PendingComponentDto>> getPendingComponents(
            @RequestParam(required = false) Long projectId
    ) {
        return ResponseEntity.ok(componentReviewService.getPendingComponents(projectId));
    }

    // ===== 제출된 컴포넌트 목록 조회 (프로젝트별 그룹) =====
    @GetMapping("/components/pending/grouped")
    @PreAuthorize("hasAnyRole('ADMIN', 'PUBLISHER')")
    public ResponseEntity<List<PendingComponentGroupDto>> getPendingComponentsGrouped() {
        return ResponseEntity.ok(
                // 새로 만든 그룹 조회 메서드 사용
                ((com.boardgame.backend_spring.review.service.impl.ComponentReviewServiceImpl) componentReviewService)
                        .getPendingComponentsGrouped()
        );
    }

    // ===== 컴포넌트 상세조회 =====
    @GetMapping("/components/{componentId}")
    public ResponseEntity<ComponentReviewDetailDto> getComponentDetail(@PathVariable Long componentId) {
        return ResponseEntity.ok(componentReviewQueryService.getComponentDetail(componentId));
    }

    // =====  컴포넌트 승인/반려 =====
    @PostMapping("/components/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'PUBLISHER')")
    public ResponseEntity<String> reviewComponent(@RequestBody ReviewComponentRequest request) {
        String msg = componentReviewService.reviewComponent(
                request.getComponentId(),
                request.isApprove(),
                request.getReason()
        );
        return ResponseEntity.ok(msg);
    }
}
