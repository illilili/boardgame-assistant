package com.boardgame.backend_spring.review.controller;

import com.boardgame.backend_spring.review.dto.PendingPlanDto;
import com.boardgame.backend_spring.review.dto.ReviewPlanRequest;
import com.boardgame.backend_spring.review.service.PlanReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {

    private final PlanReviewService planReviewService;

    @PostMapping("/approve")
    public ResponseEntity<String> reviewPlan(@RequestBody ReviewPlanRequest request) {
        String message = planReviewService.reviewPlan(
                request.getPlanId(),
                request.isApprove(),
                request.getReason()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingPlanDto>> getPendingPlans() {
        return ResponseEntity.ok(planReviewService.getPendingPlans());
    }
}
