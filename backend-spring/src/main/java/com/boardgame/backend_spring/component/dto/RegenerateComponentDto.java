// 파일: component/dto/RegenerateComponentDto.java
package com.boardgame.backend_spring.component.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

public class RegenerateComponentDto {

    /** React -> Spring 요청 DTO */
    public record Request(long conceptId, String feedback) {}

    /**
     * Spring -> FastAPI 요청에 사용할 내부 DTO
     * FastAPI의 Pydantic 모델과 필드명을 일치시켜야 합니다.
     */
    @Builder
    public record FastApiRequest(
            @JsonProperty("current_components_json") String currentComponentsJson,
            String feedback,
            String theme,
            String playerCount,
            double averageWeight,
            String ideaText,
            String mechanics,
            String storyline,
            String mainGoal,
            String winConditionType,
            @JsonProperty("world_setting") String worldSetting,
            @JsonProperty("world_tone") String worldTone
    ) {}
}