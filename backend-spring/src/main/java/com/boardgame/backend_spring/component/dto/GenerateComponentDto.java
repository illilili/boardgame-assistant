// 파일: component/dto/GenerateComponentDto.java
package com.boardgame.backend_spring.component.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class GenerateComponentDto {

    /** React -> Spring 요청 DTO */
    public record Request(long conceptId) {}

    /** Spring -> React 최종 응답 DTO */
    public record Response(@JsonProperty("component") List<ComponentDetail> component) {}

    @Data
    @Builder
    public static class ComponentDetail {
        private long componentId;
        private String type;
        private String title;
        private String quantity;
        private String roleAndEffect;
        private String artConcept;
        private String interconnection;
        private List<SubTaskDetail> subTasks;
    }

    @Data
    @Builder
    public static class SubTaskDetail {
        private long contentId;
        private String type;
        private String status;
    }

    /** Spring -> FastAPI 요청에 사용할 내부 DTO */
    @Builder
    public record FastApiRequest(
            String theme, String ideaText, String mechanics,
            String mainGoal, String turnStructure, List<String> actionRules
    ) {}

    /** FastAPI -> Spring 응답을 받을 내부 DTO */
    public record FastApiResponse(@JsonProperty("components") List<FastApiComponentItem> components) {}

    @Data
    @NoArgsConstructor
    public static class FastApiComponentItem {
        private String type;
        private String title;
        private String quantity;
        @JsonProperty("role_and_effect")
        private String roleAndEffect;
        @JsonProperty("art_concept")
        private String artConcept;
        private String interconnection;
    }
}