package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.plan.dto.PlanDetailResponse;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans/approved")
@RequiredArgsConstructor
public class PlanApprovalController {

    private final PlanRepository planRepository;
    private final ProjectRepository projectRepository;

    // 🚨 수정된 부분
    @GetMapping("/project/{projectId}")
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

    // 기획안 승인 상태로 변경 API
    @PostMapping("/{planId}/approve")
    @Transactional
    public ResponseEntity<String> approvePlan(@PathVariable Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 기획안이 존재하지 않습니다. planId = " + planId));

        if (plan.getStatus() == PlanStatus.APPROVED) {
            return ResponseEntity.badRequest().body("이미 승인된 기획안입니다.");
        }

        plan.setStatus(PlanStatus.APPROVED);
        planRepository.save(plan);

        Project project = plan.getProject();
        if (project != null) {
            project.setApprovedPlan(plan);
            projectRepository.save(project);
        } else {
            throw new EntityNotFoundException("기획안에 연결된 프로젝트가 존재하지 않습니다.");
        }

        return ResponseEntity.ok("기획안 ID " + planId + "이(가) 성공적으로 승인되었습니다.");
    }
}