package com.boardgame.backend_spring.content.service;

import com.boardgame.backend_spring.content.dto.*;
import org.springframework.stereotype.Service;
import java.util.HashMap;

@Service
public class ContentServiceImpl implements ContentService {

    private final PythonApiService pythonApiService;
    
    // 생성자를 통한 의존성 주입
    public ContentServiceImpl(PythonApiService pythonApiService) {
        this.pythonApiService = pythonApiService;
    }

    @Override
    public void deleteContent(Long contentId) {
        // 실제 삭제 로직 필요. 현재는 더미 구현
    }
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
    // --- 생성/조회 기능 더미 구현 ---
    @Override
    public ContentSaveResponse saveContent(ContentSaveRequest request) {
        return new ContentSaveResponse(3015L, "콘텐츠가 성공적으로 저장되었습니다.");
    }

    @Override
    public ContentSubmitResponse submitContent(ContentSubmitRequest request) {
        return new ContentSubmitResponse(request.getContentId(), "PENDING_REVIEW", "검토 요청이 정상적으로 접수되었습니다.");
    }

    
    @Override
    public TextGenerateResponse generateText(TextGenerateRequest request) {
        TextGenerateResponse.GeneratedText text = new TextGenerateResponse.GeneratedText(1001L, "카드 효과", "적을 2턴간 기절시킵니다.");
        return new TextGenerateResponse(request.getPlanId(), request.getContentType(), java.util.Collections.singletonList(text));
    }

    @Override
    public ImageGenerateResponse generateImage(ImageGenerateRequest request) {
        return new ImageGenerateResponse(2001L, "https://example.com/image/2001.png");
    }

    @Override
    public RulebookGenerateResponse generateRulebook(RulebookGenerateRequest request) {
        return new RulebookGenerateResponse("기본 규칙서", "https://example.com/rulebook/plan" + request.getPlanId() + ".pdf", java.time.LocalDateTime.now());
    }

    @Override
    public DescriptionScriptResponse generateDescriptionScript(DescriptionScriptRequest request) {
        DescriptionScriptResponse.Script script = new DescriptionScriptResponse.Script("게임 소개", java.util.Arrays.asList("이 게임은...", "목표는..."));
        return new DescriptionScriptResponse(request.getPlanId(), request.getTarget(), script, "약 2분");
    }

    @Override
    public Generate3DModelResponse generate3DModel(Generate3DModelRequest request) {
        return new Generate3DModelResponse(3001L, "https://example.com/3d/preview/3001.glb", "https://example.com/3d/refined/3001.glb", "READY");
    }

    @Override
    public ThumbnailGenerationResponse generateThumbnail(ThumbnailGenerationRequest request) {
        try {
            // Python API 서버 상태 확인
            if (!pythonApiService.isHealthy()) {
                throw new RuntimeException("Python API 서버에 연결할 수 없습니다.");
            }
            
            // Python API 호출하여 실제 썸네일 생성
            return pythonApiService.generateThumbnail(request);
            
        } catch (Exception e) {
            // 오류 발생 시 기본 응답 반환
            System.err.println("썸네일 생성 중 오류 발생: " + e.getMessage());
            return new ThumbnailGenerationResponse(4001L, "https://example.com/thumbnail/4001.png");
        }
    }
}
