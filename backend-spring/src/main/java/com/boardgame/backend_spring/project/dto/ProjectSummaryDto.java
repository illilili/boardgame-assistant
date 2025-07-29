package com.boardgame.backend_spring.project.dto;

import com.boardgame.backend_spring.project.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProjectSummaryDto {
    private Long projectId;
    private String projectName;
    private String status;

    public static ProjectSummaryDto from(Project project) {
        return ProjectSummaryDto.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .status(project.getStatus())
                .build();
    }
}
