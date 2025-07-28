package com.boardgame.backend_spring.plan.service;

import com.boardgame.backend_spring.plan.dto.PlanSaveRequestDto;
import com.boardgame.backend_spring.plan.dto.PlanDetailResponseDto;
import com.boardgame.backend_spring.plan.entity.*;
import com.boardgame.backend_spring.plan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final PlanConceptRepository conceptRepository;
    private final PlanGoalRepository goalRepository;
    private final PlanRuleRepository ruleRepository;
    private final PlanComponentRepository componentRepository;

    public Long savePlan(PlanSaveRequestDto dto) {
        // 1. Plan 생성
        Plan plan = Plan.builder()
                .projectId(dto.getProjectId())
                .title(dto.getTitle())
                .status(PlanStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        planRepository.save(plan);

        // 2. Concept 저장
        PlanConcept concept = PlanConcept.builder()
                .theme(dto.getTheme())
                .storyline(dto.getStoryline())
                .plan(plan)
                .build();
        conceptRepository.save(concept);

        // 3. Goal 저장
        PlanGoal goal = PlanGoal.builder()
                .goalText(dto.getGoalText())
                .plan(plan)
                .build();
        goalRepository.save(goal);

        // 4. Rule 저장
        PlanRule rule = PlanRule.builder()
                .ruleText(dto.getRuleText())
                .plan(plan)
                .build();
        ruleRepository.save(rule);

        // 5. Components 저장
        List<PlanComponent> components = new ArrayList<>();
        for (PlanSaveRequestDto.ComponentDto compDto : dto.getComponents()) {
            PlanComponent component = PlanComponent.builder()
                    .name(compDto.getName())
                    .description(compDto.getDescription())
                    .plan(plan)
                    .build();
            components.add(component);
        }
        componentRepository.saveAll(components);

        return plan.getId();
    }

    // 기획안 상세 조회: Plan ID를 기반으로 연관된 구성요소 전체 반환
    public PlanDetailResponseDto getPlanDetail(Long planId) {
        // 1. Plan (기획안 본체) 조회
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("해당 기획안이 존재하지 않습니다."));

        // 2. Plan 하위 엔티티들 조회
        PlanConcept concept = conceptRepository.findByPlan(plan).orElse(null);
        PlanGoal goal = goalRepository.findByPlan(plan).orElse(null);
        PlanRule rule = ruleRepository.findByPlan(plan).orElse(null);
        List<PlanComponent> componentList = componentRepository.findByPlan(plan);

        // 3. 응답 DTO 생성
        PlanDetailResponseDto dto = new PlanDetailResponseDto();
        dto.setPlanId(plan.getId());
        dto.setTitle(plan.getTitle());

        if (concept != null) {
            dto.setTheme(concept.getTheme());
            dto.setStoryline(concept.getStoryline());
        }

        if (goal != null) {
            dto.setGoalText(goal.getGoalText());
        }

        if (rule != null) {
            dto.setRuleText(rule.getRuleText());
        }

        // 4. 구성 요소 리스트 DTO로 변환
        List<PlanDetailResponseDto.ComponentDto> components = componentList.stream().map(component -> {
            PlanDetailResponseDto.ComponentDto c = new PlanDetailResponseDto.ComponentDto();
            c.setName(component.getName());
            c.setDescription(component.getDescription());
            return c;
        }).toList();

        dto.setComponents(components);

        return dto;
    }

}
