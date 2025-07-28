package com.boardgame.backend_spring.content.service;

import com.boardgame.backend_spring.content.dto.*;
import org.springframework.stereotype.Service;
import java.util.HashMap;

@Service
public class ContentServiceImpl implements ContentService {
    @Override
    public ContentDetailResponse getContentDetail(Long contentId) {
        // 더미 데이터 반환 (실제 구현 필요)
        HashMap<String, Object> contentData = new HashMap<>();
        ContentDetailResponse response = new ContentDetailResponse(
            contentId,
            1012L,
            "card_text",
            "카드 효과 문구 v1",
            contentData,
            "2025-07-24T15:31:00Z"
        );
        return response;
    }

    @Override
    public ContentSaveResponse saveContent(ContentSaveRequest request) {
        // 더미 응답 (실제 저장 로직 필요)
        return new ContentSaveResponse(3015L, "콘텐츠가 성공적으로 저장되었습니다.");
    }

    @Override
    public ContentSubmitResponse submitContent(ContentSubmitRequest request) {
        // 더미 응답 (실제 제출 로직 필요)
        return new ContentSubmitResponse(request.getContentId(), "PENDING_REVIEW", "검토 요청이 정상적으로 접수되었습니다.");
    }
}
