package com.boardgame.backend_spring.task.service;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.task.dto.SubTaskDto;
import com.boardgame.backend_spring.task.dto.TaskComponentDto;
import com.boardgame.backend_spring.task.dto.TaskListResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final PlanRepository planRepository;
    private final ComponentRepository componentRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public TaskListResponseDto getTaskListByProject(Long projectId) {
        // 1. 승인된 기획안 조회
        Plan plan = planRepository.findByProjectIdAndStatus(projectId, PlanStatus.APPROVED)
                .orElseThrow(() -> new EntityNotFoundException("승인된 기획안이 존재하지 않습니다."));

        BoardgameConcept concept = plan.getBoardgameConcept();
        List<Component> components = componentRepository.findByBoardgameConcept(concept);

        // 2. 고정 컴포넌트 추가 (룰북, 영상 스크립트, 썸네일)
        components.addAll(createFixedComponents());

        // 3. DTO 변환
        List<TaskComponentDto> componentDtos = components.stream()
                .map(this::toTaskComponentDto)
                .collect(Collectors.toList());

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 정보를 찾을 수 없습니다."));

        return TaskListResponseDto.builder()
                .projectId(projectId)
                .projectTitle(project.getName())
                .components(componentDtos)
                .build();
    }

    private TaskComponentDto toTaskComponentDto(Component component) {
        List<SubTask> subTasks = component.getSubTasks();
        String statusSummary = calculateStatusSummary(subTasks);

        return TaskComponentDto.builder()
                .componentId(component.getComponentId())
                .type(component.getType())
                .title(component.getTitle())
                .quantity(component.getQuantity())
                .roleAndEffect(component.getRoleAndEffect())
                .artConcept(component.getArtConcept())
                .interconnection(component.getInterconnection())
                .statusSummary(statusSummary)
                .subTasks(subTasks.stream().map(this::toSubTaskDto).collect(Collectors.toList()))
                .build();
    }

    private SubTaskDto toSubTaskDto(SubTask subTask) {
        return SubTaskDto.builder()
                .contentId(subTask.getContentId())
                .type(subTask.getType())
                .status(subTask.getStatus())
                .build();
    }

    private List<Component> createFixedComponents() {
        // 개발 필수 고정 항목 3종 추가
        Component rulebook = new Component();
        rulebook.setComponentId(-1L);
        rulebook.setType("Document");
        rulebook.setTitle("룰북 초안");
        rulebook.setSubTasks(List.of(makeFixedSubTask("text")));

        Component script = new Component();
        script.setComponentId(-2L);
        script.setType("Script");
        script.setTitle("영상 설명 스크립트");
        script.setSubTasks(List.of(makeFixedSubTask("text")));

        Component thumbnail = new Component();
        thumbnail.setComponentId(-3L);
        thumbnail.setType("Image");
        thumbnail.setTitle("썸네일 이미지");
        thumbnail.setSubTasks(List.of(makeFixedSubTask("image")));

        return List.of(rulebook, script, thumbnail);
    }

    private SubTask makeFixedSubTask(String type) {
        SubTask task = new SubTask();
        task.setContentId(null); // 저장되지 않은 가상의 task
        task.setType(type);
        task.setStatus("NOT_STARTED");
        return task;
    }

    private String calculateStatusSummary(List<SubTask> subTasks) {
        boolean anyInProgress = subTasks.stream().anyMatch(t -> t.getStatus().equals("IN_PROGRESS"));
        boolean allSubmitted = subTasks.stream().allMatch(t -> t.getStatus().equals("SUBMITTED") || t.getStatus().equals("APPROVED"));
        boolean allNotStarted = subTasks.stream().allMatch(t -> t.getStatus().equals("NOT_STARTED"));

        if (anyInProgress) return "작업 중";
        if (allSubmitted) return "제출 완료";
        if (allNotStarted) return "작업 대기";
        return "진행 중"; // default fallback
    }
}
