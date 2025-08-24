package com.boardgame.backend_spring.content.service.model3d.impl;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelRequest;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelResponse;
import com.boardgame.backend_spring.content.dto.model3d.Model3DPreviewDto;
import com.boardgame.backend_spring.content.dto.model3d.Model3DUserRequest;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.service.PythonApiService;
import com.boardgame.backend_spring.content.service.model3d.Model3dContentService;
import com.boardgame.backend_spring.component.service.ComponentStatusService;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 3D 모델 생성 요청을 처리하는 서비스 구현체
 */
@Service
@RequiredArgsConstructor
public class Model3dContentServiceImpl implements Model3dContentService {

    private final PythonApiService pythonApiService;
    private final ContentRepository contentRepository;
    private final ComponentRepository componentRepository;
    private final PlanRepository planRepository;
    private final SubTaskRepository subTaskRepository;
    private final ComponentStatusService componentStatusService;

    @Override
    public Generate3DModelResponse generate3DModel(Model3DUserRequest userRequest) {
        // 콘텐츠 조회
        Content content = contentRepository.findById(userRequest.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));
        // 상태 변경: IN_PROGRESS
        SubTask subTask = subTaskRepository.findByContentId(userRequest.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);
        componentStatusService.recalcAndSave(subTask.getComponent());

        // 구성요소 및 기획안 정보 추출
        Component component = content.getComponent();
        BoardgameConcept concept = component.getBoardgameConcept();
        Plan plan = planRepository.findByBoardgameConcept(concept)
                .orElseThrow(() -> new IllegalArgumentException("해당 컨셉에 연결된 기획안이 없습니다."));

        // FastAPI 요청용 DTO 생성 및 보완
        Generate3DModelRequest request = new Generate3DModelRequest();
        request.setContentId(userRequest.getContentId());
        request.setName(userRequest.getName());
        request.setDescription(userRequest.getDescription());
        request.setComponentInfo(userRequest.getComponentInfo());
        request.setStyle(userRequest.getStyle());

        request.setTheme(concept.getTheme());
        request.setStoryline(concept.getStoryline());

        if (request.getComponentInfo() == null || request.getComponentInfo().isBlank()) {
            request.setComponentInfo(component.getArtConcept());
        }

        // FastAPI 호출
        Generate3DModelResponse response = pythonApiService.generate3DModel(request);

        // 콘텐츠에 previewUrl 저장
        if (response.getRefinedUrl() != null && !response.getRefinedUrl().isBlank()) {
            content.setContentData(response.getRefinedUrl());
        } else {
            content.setContentData(response.getPreviewUrl());
        }
        contentRepository.save(content);

        return response;
    }

    @Override
    public Model3DPreviewDto getModel3DPreview(Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        Component component = content.getComponent();
        BoardgameConcept concept = component.getBoardgameConcept();

        Model3DPreviewDto dto = new Model3DPreviewDto();
        dto.setContentId(contentId);
        dto.setName(component.getTitle());
        dto.setDescription(component.getArtConcept());
        dto.setArtConcept(component.getArtConcept());
        dto.setTheme(concept.getTheme());
        dto.setStoryline(concept.getStoryline());

        return dto;
    }

    @Override
    public Generate3DTaskResponse generate3DModelTask(Model3DUserRequest userRequest) {
        // 콘텐츠 조회
        Content content = contentRepository.findById(userRequest.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        // 상태 변경: IN_PROGRESS
        SubTask subTask = subTaskRepository.findByContentId(userRequest.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("IN_PROGRESS");
        subTaskRepository.save(subTask);
        componentStatusService.recalcAndSave(subTask.getComponent());

        // FastAPI 비동기 API 호출
        Generate3DTaskResponse response = pythonApiService.generate3DModelTask(userRequest);

        return response;
    }
}
