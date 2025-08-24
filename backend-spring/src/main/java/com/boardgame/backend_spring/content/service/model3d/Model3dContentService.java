package com.boardgame.backend_spring.content.service.model3d;

import com.boardgame.backend_spring.content.dto.model3d.Model3DPreviewDto;
import com.boardgame.backend_spring.content.dto.model3d.Model3DUserRequest;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelResponse;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DTaskResponse;

public interface Model3dContentService {
    Generate3DModelResponse generate3DModel(Model3DUserRequest userRequest);
    Generate3DTaskResponse generate3DModelTask(Model3DUserRequest userRequest);
    Model3DPreviewDto getModel3DPreview(Long contentId);
}