package com.boardgame.backend_spring.goal.dto;

import java.util.List;

public record GameObjectiveResponse(
        String mainGoal,
        List<String> subGoals,
        String winConditionType,
        String designNote
) {
}