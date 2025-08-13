package com.boardgame.backend_spring.task.dto;

import com.boardgame.backend_spring.component.entity.SubTask;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 각 구성요소(Task 단위) DTO
 */
@Data
@Builder
public class TaskComponentDto {

    private Long componentId;
    private String type;
    private String title;
    private String quantity;
    private String roleAndEffect;
    private String artConcept;
    private String interconnection;
    private String statusSummary;

    private List<SubTaskDto> subTasks;


}
