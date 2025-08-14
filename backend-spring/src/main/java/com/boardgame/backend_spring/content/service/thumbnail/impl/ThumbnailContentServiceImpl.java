package com.boardgame.backend_spring.content.service.thumbnail.impl;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.component.service.ComponentStatusService;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateRequest;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateResponse;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailPreviewDto;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.service.PythonApiService;
import com.boardgame.backend_spring.content.service.thumbnail.ThumbnailContentService;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ThumbnailContentServiceImpl implements ThumbnailContentService {

    private final PythonApiService pythonApiService;
    private final ContentRepository contentRepository;
    private final PlanRepository planRepository;
    private final SubTaskRepository subTaskRepository;
    private final ComponentStatusService componentStatusService;
    private final ProjectRepository projectRepository;

    @Override
    public ThumbnailGenerateResponse generateThumbnail(Long contentId) {
        // 1. Content → Component → BoardgameConcept → Plan
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        Component component = content.getComponent();
        Plan plan = planRepository.findByBoardgameConcept(component.getBoardgameConcept())
                .orElseThrow(() -> new IllegalArgumentException("기획안 정보를 찾을 수 없습니다."));

        // 2. SubTask 상태 변경
        SubTask subTask = subTaskRepository.findByContentId(contentId)
                .orElseThrow(() -> new IllegalArgumentException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);
        componentStatusService.recalcAndSave(subTask.getComponent());

        // 3. FastAPI 호출 요청 구성
        ThumbnailGenerateRequest aiRequest = new ThumbnailGenerateRequest();
        aiRequest.setContentId(contentId);
        aiRequest.setTheme(plan.getBoardgameConcept().getTheme());
        aiRequest.setStoryline(plan.getBoardgameConcept().getStoryline());

        // 4. FastAPI 호출
        ThumbnailGenerateResponse response = pythonApiService.generateThumbnail(aiRequest);

        // 5. 결과 저장
        content.setContentData(response.getThumbnailUrl());
        contentRepository.save(content);

        Project project = plan.getProject(); // Plan → Project 연관관계 필요
        project.setThumbnailUrl(response.getThumbnailUrl());
        projectRepository.save(project);

        return response;
    }

    @Override
    public ThumbnailPreviewDto getThumbnailPreview(Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        Component component = content.getComponent();
        BoardgameConcept concept = component.getBoardgameConcept();

        ThumbnailPreviewDto dto = new ThumbnailPreviewDto();
        dto.setContentId(contentId);
        dto.setTheme(concept.getTheme());
        dto.setStoryline(concept.getStoryline());

        return dto;
    }
}
