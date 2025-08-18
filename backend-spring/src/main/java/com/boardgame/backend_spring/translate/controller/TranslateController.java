package com.boardgame.backend_spring.translate.controller;

import com.boardgame.backend_spring.project.enumtype.ProjectStatus;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.translate.dto.*;
import com.boardgame.backend_spring.translate.service.TranslateService;
import com.boardgame.backend_spring.translate.dto.TranslationCandidateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 퍼블리셔 번역 관련 API
 * (JWT/권한체크 제거, 테스트용)
 */
@RestController
@RequestMapping("/api/translate")
@RequiredArgsConstructor
public class TranslateController {

    private final TranslateService translateService;
    private final ProjectRepository projectRepository;

    /**
     * [퍼블리셔] 다국어 번역 요청
     * POST /api/translate/request
     * body: TranslationRequest { contentId, targetLanguages[], feedback? }
     */
    @PostMapping("/request")
    public ResponseEntity<TranslationResponse> requestTranslation(
            @RequestBody TranslationRequest dto
    ) {
        // 1) 번역 요청 처리 (기존 로직)
        TranslationResponse res = translateService.requestTranslations(null, dto);

        // 2) 프로젝트 상태 전환: DEVELOPMENT -> PUBLISHING (최초 요청 시)
        projectRepository.findProjectByContentId(dto.getContentId()).ifPresent(project -> {
            if (project.getStatus() == ProjectStatus.DEVELOPMENT) {
                project.setStatus(ProjectStatus.PUBLISHING);
                projectRepository.save(project);
            }
        });

        return ResponseEntity.ok(res);
    }



    /**
     * contentId 기준 번역 히스토리 조회
     * GET /api/translate/{contentId}
     */
    @GetMapping("/{contentId}")
    public ResponseEntity<List<TranslationItemDto>> getTranslationsByContent(
            @PathVariable Long contentId,
            @RequestParam(name = "latestOnly", defaultValue = "false") boolean latestOnly
    ) {
        return ResponseEntity.ok(translateService.getTranslationsByContent(contentId, latestOnly));
    }

    //최신 1건씩 만 조회


    /**
     * FastAPI 콜백 처리
     * POST /api/translate/callback
     */
    @PostMapping("/callback")
    public ResponseEntity<TranslationItemDto> handleCallback(
            @RequestBody TranslationCallbackRequest cb
    ) {
        return ResponseEntity.ok(translateService.handleCallback(cb));
    }


    // 완료 처리(수동)
    @PutMapping("/{translationId}/complete")
    public ResponseEntity<TranslationItemDto> complete(
            @PathVariable Long translationId
    ) {
        return ResponseEntity.ok(translateService.completeTranslation(translationId));
    }

    /**
     * [퍼블리셔] 프로젝트 내 번역 후보 목록 조회
     * GET /api/translate/candidates?projectId=...
     */
    @GetMapping("/candidates")
    public ResponseEntity<List<TranslationCandidateDto>> listCandidates(
            @RequestParam Long projectId
    ) {
        return ResponseEntity.ok(translateService.listTranslationCandidates(projectId));
    }
}
