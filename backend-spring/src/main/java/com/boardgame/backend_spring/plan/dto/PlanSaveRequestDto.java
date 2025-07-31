package com.boardgame.backend_spring.plan.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlanSaveRequestDto {
    private Long projectId;
    private String title;

    // PlanConcept
    private String theme;
    private String storyline;

    // PlanGoal
    private String goalText;

    // PlanRule
    private String ruleText;

    // PlanComponent 목록
    private List<ComponentDto> components;

    @Getter
    @Setter
    public static class ComponentDto {
        private String name;
        private String description;
    }
}
