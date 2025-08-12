package com.boardgame.backend_spring.review.service;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.review.dto.PendingPlanDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanReviewService {

    private final PlanRepository planRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<PendingPlanDto> getPendingPlans() {
        return planRepository.findByStatus(PlanStatus.SUBMITTED).stream()
                .map(plan -> PendingPlanDto.builder()
                        .planId(plan.getPlanId())
                        .projectTitle(plan.getProject().getName())
                        .conceptTheme(plan.getBoardgameConcept().getTheme())
                        .planDocUrl(plan.getPlanDocUrl())
                        .status(plan.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public String reviewPlan(Long planId, boolean approve, String reason) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found"));

        Project project = plan.getProject();

        if (approve) {
            plan.setStatus(PlanStatus.APPROVED);
            project.setApprovedPlan(plan);
            projectRepository.save(project);
            planRepository.save(plan);
            return "기획안이 승인되었습니다.";
        } else {
            plan.setStatus(PlanStatus.REJECTED);
            plan.setRejectionReason(reason);
            planRepository.save(plan);
            return "기획안이 반려되었습니다. 사유: " + reason;
        }
    }
}
