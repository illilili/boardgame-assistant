package com.boardgame.backend_spring.pricing.controller;

import com.boardgame.backend_spring.pricing.dto.PricingEstimateGenerateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateResponse;
import com.boardgame.backend_spring.pricing.service.PricingService;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.enumtype.ProjectStatus;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;
    private final ProjectRepository projectRepository;

    /**
     * 자동 가격 책정
     * - 규칙: 프로젝트 상태가 DEVELOPMENT면 출판(PUBLISHING) 단계로 전환 (최초 1회)
     * - 이미 PUBLISHING/COMPLETED면 상태 변경 없음
     */
    @PostMapping("/estimate")
    public ResponseEntity<PricingEstimateResponse> estimatePrice(
            @RequestBody PricingEstimateGenerateRequest request
    ) {
        // 1) 가격 산정
        PricingEstimateResponse response = pricingService.estimatePrice(request);

        // 2) 프로젝트 조회 (projectId 사용)
        Optional<Project> projectOpt = Optional.empty();
        if (request.getPlanId() != null) {
            projectOpt = projectRepository.findByApprovedPlanId(request.getPlanId());
        }

        // 3) 상태 전환: DEVELOPMENT → PUBLISHING (멱등)
        projectOpt.ifPresent(project -> {
            if (project.getStatus() == ProjectStatus.DEVELOPMENT) {
                project.setStatus(ProjectStatus.PUBLISHING);
                projectRepository.save(project);
            }
        });

        return ResponseEntity.ok(response);
    }
}
