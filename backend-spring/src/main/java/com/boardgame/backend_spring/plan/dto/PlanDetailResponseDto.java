package com.boardgame.backend_spring.plan.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlanDetailResponseDto {
    private Long planId;
    private String title;
    private String theme;
    private String storyline;
    private String goalText;
    private String ruleText;
    private List<ComponentDto> components;

    @Getter
    @Setter
    public static class ComponentDto {
        private String name;
        private String description;
    }
}
