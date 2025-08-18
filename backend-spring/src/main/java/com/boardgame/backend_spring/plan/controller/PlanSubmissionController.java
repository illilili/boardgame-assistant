package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.log.service.ActionLogger;
import com.boardgame.backend_spring.plan.dto.PlanDetailResponse;
import com.boardgame.backend_spring.plan.dto.PlanSubmitResponse;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.plan.service.PlanSubmissionService;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.enumtype.ProjectStatus;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
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
    private final ProjectRepository projectRepository;
    private final ActionLogger actionLogger;

    /**
     * 기획안 제출: 프로젝트 상태를 REVIEW_PENDING으로 전환
     */
    @PostMapping(value = "/{planId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlanSubmitResponse> submitPlan(
            @PathVariable Long planId,
            @RequestPart("file") MultipartFile file) throws IOException {

        // 1) 기획안 제출 처리 (파일 업로드 등)
        Plan plan = submissionService.submitPlan(planId, file);

        // 2) 프로젝트 상태 전환 (PLANNING → REVIEW_PENDING)
        //    Plan ↔ Project 연관관계가 있어야 함 (plan.getProject())
        Project project = plan.getProject();
        if (project == null) {
            throw new EntityNotFoundException("Plan(" + planId + ")에 연결된 Project가 없습니다.");
        }
        project.setStatus(ProjectStatus.REVIEW_PENDING);
        projectRepository.save(project);

        // 로그 기록
        actionLogger.log("PLAN_SUBMIT", "PLAN", plan.getPlanId());

        // 3) 응답
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
                .projectId(plan.getProject() != null ? plan.getProject().getId() : null)
                .currentContent(plan.getCurrentContent())
                .planDocUrl(plan.getPlanDocUrl())
                .status(plan.getStatus())
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<String> deletePlan(@PathVariable Long planId) {
        try {
            submissionService.deletePlan(planId);
            return ResponseEntity.ok("기획안이 성공적으로 삭제되었습니다.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}