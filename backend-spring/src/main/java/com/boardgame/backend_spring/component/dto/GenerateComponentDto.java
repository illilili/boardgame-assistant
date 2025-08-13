package com.boardgame.backend_spring.component.dto;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

public class GenerateComponentDto {

    public record Request(long conceptId) {}
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

        public static ComponentDetail fromEntity(Component component) {
            return ComponentDetail.builder()
                    .componentId(component.getComponentId())
                    .type(component.getType())
                    .title(component.getTitle())
                    .quantity(component.getQuantity())
                    .roleAndEffect(component.getRoleAndEffect())
                    .artConcept(component.getArtConcept())
                    .interconnection(component.getInterconnection())
                    .subTasks(component.getSubTasks().stream()
                            .map(SubTaskDetail::fromEntity)
                            .collect(Collectors.toList()))
                    .build();
        }
    }

    @Data
    @Builder
    public static class SubTaskDetail {
        private long id; // SubTask의 고유 ID
        private String type;
        private String status;

        public static SubTaskDetail fromEntity(SubTask subTask) {
            return SubTaskDetail.builder()
                    .id(subTask.getId())
                    .type(subTask.getType())
                    .status(subTask.getStatus())
                    .build();
        }
    }

    @Builder
    public record FastApiRequest(
            String theme, String ideaText, String mechanics,
            String mainGoal, String turnStructure, List<String> actionRules
    ) {}

    public record FastApiResponse(@JsonProperty("components") List<FastApiComponentItem> components) {}

    // 🚨 [수정] examples 필드를 제거합니다.
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

    // 🚨 [삭제] ExampleItem 클래스는 더 이상 필요 없으므로 클래스 전체를 삭제합니다.
}