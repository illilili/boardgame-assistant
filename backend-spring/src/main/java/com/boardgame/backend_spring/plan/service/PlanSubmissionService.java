package com.boardgame.backend_spring.plan.service;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

    @Service
    @RequiredArgsConstructor
    public class PlanSubmissionService {

        private final PlanRepository planRepository;

        public void submitPlan(Long planId) {
            Plan plan = planRepository.findById(planId)
                    .orElseThrow(() -> new EntityNotFoundException("Plan not found"));
            plan.setStatus(PlanStatus.SUBMITTED);
            planRepository.save(plan);
        }
    }

