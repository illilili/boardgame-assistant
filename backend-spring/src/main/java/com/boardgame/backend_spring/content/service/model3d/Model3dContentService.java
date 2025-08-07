package com.boardgame.backend_spring.content.service.model3d;

import com.boardgame.backend_spring.content.dto.model3d.Model3DUserRequest;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelResponse;

public interface Model3dContentService {
    Generate3DModelResponse generate3DModel(Model3DUserRequest userRequest);
}