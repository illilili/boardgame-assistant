package com.boardgame.backend_spring.review.service.impl;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.enumtype.ComponentStatus;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.log.entity.ActivityLog;
import com.boardgame.backend_spring.log.repository.ActivityLogRepository;
import com.boardgame.backend_spring.review.dto.PendingComponentDto;
import com.boardgame.backend_spring.review.dto.PendingComponentGroupDto;
import com.boardgame.backend_spring.review.service.ComponentReviewService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComponentReviewServiceImpl implements ComponentReviewService {

    private final ComponentRepository componentRepository;
    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PendingComponentDto> getPendingComponents(Long projectId) {
        // 기존 단일 목록 조회 방식 (그룹 필요 없을 때)
        List<Component> list = componentRepository.findByStatus(ComponentStatus.PENDING_REVIEW);

        if (projectId != null) {
            list = list.stream()
                    .filter(c -> c.getBoardgameConcept() != null
                            && c.getBoardgameConcept().getProject() != null
                            && projectId.equals(c.getBoardgameConcept().getProject().getId()))
                    .collect(Collectors.toList());
        }

        return list.stream().map(this::mapToPendingDto).collect(Collectors.toList());
    }

    /**
     * 프로젝트별 그룹으로 묶어서 반환
     */
    @Transactional(readOnly = true)
    public List<PendingComponentGroupDto> getPendingComponentsGrouped() {
        List<Component> list = componentRepository.findByStatus(ComponentStatus.PENDING_REVIEW);

        return list.stream()
                .collect(Collectors.groupingBy(c -> {
                    if (c.getBoardgameConcept() != null && c.getBoardgameConcept().getProject() != null) {
                        return c.getBoardgameConcept().getProject().getId();
                    }
                    return null;
                }))
                .entrySet().stream()
                .map(entry -> {
                    List<Component> comps = entry.getValue();
                    String projectTitle = (comps.get(0).getBoardgameConcept() != null
                            && comps.get(0).getBoardgameConcept().getProject() != null)
                            ? comps.get(0).getBoardgameConcept().getProject().getName()
                            : "(프로젝트 없음)";

                    return PendingComponentGroupDto.builder()
                            .projectId(entry.getKey())
                            .projectTitle(projectTitle)
                            .items(
                                    comps.stream()
                                            .map(this::mapToPendingDtoWithSubmitter) // ★ 변경
                                            .collect(Collectors.toList())
                            )
                            .build();
                })
                .collect(Collectors.toList());
    }

    private PendingComponentDto mapToPendingDtoWithSubmitter(Component c) {
        String submittedBy = activityLogRepository
                .findTopByActionAndTargetTypeAndTargetIdOrderByTimestampDesc(
                        "COMPONENT_SUBMIT", "CONTENT", c.getComponentId()
                )
                .map(ActivityLog::getUsername)
                .orElse(null);

        return PendingComponentDto.builder()
                .componentId(c.getComponentId())
                .componentTitle(c.getTitle())
                .componentType(c.getType())
                .status(c.getStatus())
                .projectTitle(
                        c.getBoardgameConcept() != null && c.getBoardgameConcept().getProject() != null
                                ? c.getBoardgameConcept().getProject().getName()
                                : null
                )
                .submittedBy(submittedBy) // ★ 추가
                .build();
    }

    private PendingComponentDto mapToPendingDto(Component c) {
        return PendingComponentDto.builder()
                .componentId(c.getComponentId())
                .componentTitle(c.getTitle())
                .componentType(c.getType())
                .status(c.getStatus())
                .projectTitle(c.getBoardgameConcept() != null && c.getBoardgameConcept().getProject() != null
                        ? c.getBoardgameConcept().getProject().getName()
                        : null)
                .build();
    }

    @Override
    @Transactional
    public String reviewComponent(Long componentId, boolean approve, String reason) {
        Component component = componentRepository.findById(componentId)
                .orElseThrow(() -> new EntityNotFoundException("Component not found: " + componentId));

        if (component.getStatus() != ComponentStatus.PENDING_REVIEW) {
            return "현재 상태에서 승인/반려할 수 없습니다. 상태: " + component.getStatus();
        }

        if (approve) {
            component.setStatus(ComponentStatus.APPROVED);
            componentRepository.save(component);
            return "컴포넌트가 승인되었습니다.";
        } else {
            component.setStatus(ComponentStatus.REJECTED);
            componentRepository.save(component);
            return "컴포넌트가 반려되었습니다. 사유: " + (reason == null ? "-" : reason);
        }
    }
}
