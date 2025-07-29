package com.boardgame.backend_spring.plan.controller;

import com.boardgame.backend_spring.plan.dto.PlanSaveRequestDto;
import com.boardgame.backend_spring.plan.dto.PlanDetailResponseDto;
import com.boardgame.backend_spring.plan.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @PostMapping("/save")
    public Long savePlan(@RequestBody PlanSaveRequestDto dto) {
        return planService.savePlan(dto);
    }

    @GetMapping("/{planId}")
    public PlanDetailResponseDto getPlan(@PathVariable Long planId) {
        return planService.getPlanDetail(planId);
    }
}
