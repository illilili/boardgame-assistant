package com.boardgame.backend_spring.content.service;

import com.boardgame.backend_spring.content.dto.*;

public interface ContentService {
    ContentDetailResponse getContentDetail(Long contentId);
    ContentSaveResponse saveContent(ContentSaveRequest request);
    ContentSubmitResponse submitContent(ContentSubmitRequest request);
}
