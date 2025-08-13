package com.boardgame.backend_spring.review.service.impl;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.review.dto.ComponentReviewDetailDto;
import com.boardgame.backend_spring.review.service.ComponentReviewQueryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ComponentReviewQueryServiceImpl implements ComponentReviewQueryService {

    private final ComponentRepository componentRepository;
    private final SubTaskRepository subTaskRepository;
    private final ContentRepository contentRepository;

    @Override
    public ComponentReviewDetailDto getComponentDetail(Long componentId) {
        Component comp = componentRepository.findById(componentId)
                .orElseThrow(() -> new EntityNotFoundException("Component not found: " + componentId));

        // ★ Java 8 호환: var, toList() 사용 금지
        List<SubTask> subTasks = subTaskRepository.findByComponent_ComponentId(componentId);

        List<Long> contentIds = subTasks.stream()
                .map(SubTask::getContentId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Content> contentMap = contentIds.isEmpty()
                ? Collections.emptyMap()
                : contentRepository.findAllById(contentIds).stream()
                .collect(Collectors.toMap(
                        // 엔티티 필드명에 맞게: 보통 getContentId()
                        Content::getContentId,
                        c -> c
                ));

        return ComponentReviewDetailDto.builder()
                .componentId(comp.getComponentId())
                .title(comp.getTitle())
                .type(comp.getType())
                .status(comp.getStatus().name())
                .items(subTasks.stream().map(st -> {
                    Content ct = st.getContentId() == null ? null : contentMap.get(st.getContentId());
                    return ComponentReviewDetailDto.Item.builder()
                            .contentId(st.getContentId())
                            .subTaskType(st.getType())
                            .subTaskStatus(st.getStatus())
                            // ★ Content에 확실히 있는 필드만: contentData (텍스트 or S3 URL)
                            .contentData(ct != null ? ct.getContentData() : null)
                            .build();
                }).collect(Collectors.toList()))
                .build();
    }
}
