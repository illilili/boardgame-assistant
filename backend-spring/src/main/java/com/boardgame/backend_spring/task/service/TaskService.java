package com.boardgame.backend_spring.task.service;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.task.dto.SubTaskDto;
import com.boardgame.backend_spring.task.dto.TaskComponentDto;
import com.boardgame.backend_spring.task.dto.TaskListResponseDto;
import com.boardgame.backend_spring.component.enumtype.ComponentStatus;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final PlanRepository planRepository;
    private final ComponentRepository componentRepository;
    private final ProjectRepository projectRepository;
    private final ContentRepository contentRepository;
    private final SubTaskRepository subTaskRepository;

    /**
     * [1] 최초 개발 목록 초기화 - 고정 컴포넌트 3종 생성
     */
    @Transactional
    public void initializeDeveloperTaskList(Long projectId) {
        Plan plan = planRepository.findByProjectIdAndStatus(projectId, PlanStatus.APPROVED)
                .orElseThrow(() -> new EntityNotFoundException("승인된 기획안이 존재하지 않습니다."));

        BoardgameConcept concept = plan.getBoardgameConcept();

        // 중복 방지: 룰북 하나라도 있으면 생략
        if (!componentRepository.existsByBoardgameConceptAndTitle(concept, "룰북 초안")) {
            // 1. 룰북
            Component rulebook = new Component();
            rulebook.setBoardgameConcept(concept);
            rulebook.setType("Document");
            rulebook.setTitle("룰북 초안");
            rulebook = componentRepository.save(rulebook);

            SubTask rulebookTask = makeFixedSubTask("text", "룰북 초안", rulebook);
            rulebookTask = subTaskRepository.save(rulebookTask);
            rulebook.setSubTasks(List.of(rulebookTask));

            // 2. 설명 스크립트
            Component script = new Component();
            script.setBoardgameConcept(concept);
            script.setType("Script");
            script.setTitle("영상 설명 스크립트");
            script = componentRepository.save(script);

            SubTask scriptTask = makeFixedSubTask("text", "영상 설명 스크립트", script);
            scriptTask = subTaskRepository.save(scriptTask);
            script.setSubTasks(List.of(scriptTask));
        }
    }

    /**
     * [2] 개발 목록 전체 조회
     */
    @Transactional(readOnly = true)
    public TaskListResponseDto getTaskListByProject(Long projectId) {
        Plan plan = planRepository.findByProjectIdAndStatus(projectId, PlanStatus.APPROVED)
                .orElseThrow(() -> new EntityNotFoundException("승인된 기획안이 존재하지 않습니다."));

        BoardgameConcept concept = plan.getBoardgameConcept();
        List<Component> components = componentRepository.findByBoardgameConcept(concept);

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
        String statusSummary = calculateStatusSummary(component);

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

    /**
     * 콘텐츠 + 서브태스크 생성
     */
    private SubTask makeFixedSubTask(String type, String title, Component component) {
        Content content = new Content();
        content.setContentType(mapContentType(type, title));
        content.setComponent(component);
        content.setCreatedAt(LocalDateTime.now());
        content = contentRepository.save(content);

        SubTask task = new SubTask();
        task.setContentId(content.getContentId());
        task.setType(type);
        task.setStatus("NOT_STARTED");
        task.setComponent(component);

        return task;
    }

    private String mapContentType(String type, String title) {
        return switch (title) {
            case "룰북 초안" -> "rulebook";
            case "영상 설명 스크립트" -> "description_script";
            case "썸네일 이미지" -> "thumbnail";
            default -> switch (type) {
                case "text" -> "card_text";
                case "image" -> "card_image";
                case "3d_model" -> "3d_model";
                default -> "unknown";
            };
        };
    }

    private String calculateStatusSummary(Component component) {
        ComponentStatus status = component.getStatus();
        if (status == null) {
            return "작업 대기"; // 기본값
        }

        return switch (status) {
            case WAITING -> "작업 대기";
            case IN_PROGRESS -> "작업 중";
            case READY_TO_SUBMIT -> "작업 완료";   // 제출 대기
            case PENDING_REVIEW -> "제출 완료";    // 승인 대기
            case APPROVED -> "승인";
            case REJECTED -> "반려";
        };
    }
}
