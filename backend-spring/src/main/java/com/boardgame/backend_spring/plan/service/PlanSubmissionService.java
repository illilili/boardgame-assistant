package com.boardgame.backend_spring.plan.service;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.s3.S3Uploader;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PlanSubmissionService {

    private final PlanRepository planRepository;
    private final S3Uploader s3Uploader;

    public Plan submitPlan(Long planId, MultipartFile file) throws IOException {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with id: " + planId));

        String uploadUrl = s3Uploader.upload(file, "plan-documents");
        plan.setPlanDocUrl(uploadUrl);
        plan.setStatus(PlanStatus.SUBMITTED);
        return planRepository.save(plan);
    }

    @Transactional // 삭제 작업도 트랜잭션 안에서 수행하는 것이 안전합니다.
    public void deletePlan(Long planId) {
        if (!planRepository.existsById(planId)) {
            throw new EntityNotFoundException("Plan not found with id: " + planId);
        }
        planRepository.deleteById(planId);
    }
}