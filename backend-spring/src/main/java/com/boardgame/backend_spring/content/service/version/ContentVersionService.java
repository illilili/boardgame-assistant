package com.boardgame.backend_spring.content.service.version;

import com.boardgame.backend_spring.content.dto.version.ContentSaveRequest;
import com.boardgame.backend_spring.content.dto.version.ContentSaveResponse;
import com.boardgame.backend_spring.content.dto.version.ContentVersionDetailResponse;
import com.boardgame.backend_spring.content.dto.version.ContentVersionListResponse;

public interface ContentVersionService {
    ContentSaveResponse saveVersion(ContentSaveRequest request);
    ContentVersionListResponse listVersions(Long contentId);
    void deleteVersion(Long versionId);

    // 선택: 특정 버전으로 콘텐츠 되돌리기
    void rollback(Long contentId, Long versionId);

    ContentVersionDetailResponse getVersionDetail(Long versionId);
}