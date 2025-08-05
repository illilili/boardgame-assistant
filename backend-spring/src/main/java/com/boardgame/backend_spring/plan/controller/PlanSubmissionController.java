package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.plan.dto.PlanSubmitRequest;
import com.boardgame.backend_spring.plan.service.PlanSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

    @RestController
    @RequestMapping("/api/plans")
    @RequiredArgsConstructor
    public class PlanSubmissionController {

        private final PlanSubmissionService submissionService;
        @PostMapping("/submit")
        public ResponseEntity<Void> submitPlan(@RequestBody PlanSubmitRequest request) {
            submissionService.submitPlan(request.getPlanId());
            return ResponseEntity.ok().build();
        }
    }
