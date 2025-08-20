// `ProjectSummaryDto.java`
package com.boardgame.backend_spring.project.dto;

import com.boardgame.backend_spring.project.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ProjectSummaryDto {
    private Long projectId;
    private String projectName;
    private String description;
    private String status;
    private String thumbnailUrl;
    private LocalDateTime createdAt;

    public static ProjectSummaryDto from(Project project) {
        return ProjectSummaryDto.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .thumbnailUrl(project.getThumbnailUrl())// enum → String 변환
                .createdAt(project.getCreatedAt())
                .build();
    }
}