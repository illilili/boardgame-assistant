package com.boardgame.backend_spring.content.controller;

import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.repository.SubTaskRepository;
import com.boardgame.backend_spring.component.service.ComponentStatusService; // ★ 추가
import com.boardgame.backend_spring.content.dto.ContentDetailResponse;
import com.boardgame.backend_spring.content.dto.card.CardImageResponse;
import com.boardgame.backend_spring.content.dto.card.CardTextGenerateRequest;
import com.boardgame.backend_spring.content.dto.card.CardTextResponse;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelResponse;
import com.boardgame.backend_spring.content.dto.model3d.Model3DUserRequest;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookGenerateRequest;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookGenerateResponse;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateRequest;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateResponse;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.service.card.CardContentService;
import com.boardgame.backend_spring.content.service.model3d.Model3dContentService;
import com.boardgame.backend_spring.content.service.rulebook.RulebookContentService;
import com.boardgame.backend_spring.content.service.thumbnail.ThumbnailContentService;
import com.boardgame.backend_spring.s3.S3Uploader;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final CardContentService contentService;
    private final Model3dContentService model3dContentService;
    private final RulebookContentService rulebookContentService;
    private final ContentRepository contentRepository;
    private final SubTaskRepository subTaskRepository;
    private final ThumbnailContentService thumbnailContentService;
    private final S3Uploader s3Uploader;

    private final ComponentStatusService componentStatusService;

    @GetMapping("/{contentId}")
    public ResponseEntity<ContentDetailResponse> getContent(@PathVariable Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 콘텐츠입니다."));
        return ResponseEntity.ok(ContentDetailResponse.from(content));
    }

    /**
     * 파일 업로드(룰북/이미지/썸네일 등) → 콘텐츠 저장 + SubTask=COMPLETED → 컴포넌트 상태 재계산
     */
    @PutMapping("/{contentId}/upload")
    public ResponseEntity<?> uploadContentFile(
            @PathVariable Long contentId,
            @RequestPart("file") MultipartFile file,
            @RequestPart("dir") String dirName // 예: rulebooks, card-images, thumbnails
    ) throws IOException {
        String s3Url = s3Uploader.upload(file, dirName);

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 콘텐츠입니다."));
        content.setContentData(s3Url);
        contentRepository.save(content);

        SubTask subTask = subTaskRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("COMPLETED");
        subTaskRepository.save(subTask);

        // 컴포넌트 상태 재계산
        componentStatusService.recalcAndSave(subTask.getComponent());

        return ResponseEntity.ok("파일 업로드 및 상태 완료");
    }

    /**
     * 수동 완료 처리(파일 없이 텍스트 등 생성 결과가 이미 저장된 경우)
     */
    @PutMapping("/{contentId}/complete")
    public ResponseEntity<?> completeContent(@PathVariable Long contentId) {
        SubTask subTask = subTaskRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("SubTask가 존재하지 않습니다."));
        subTask.setStatus("COMPLETED");
        subTaskRepository.save(subTask);

        // 컴포넌트 상태 재계산
        componentStatusService.recalcAndSave(subTask.getComponent());

        return ResponseEntity.ok("작업이 완료되었습니다.");
    }

    @PostMapping("/generate-text")
    public ResponseEntity<CardTextResponse> generateCardText(@RequestBody CardTextGenerateRequest request) {
        return ResponseEntity.ok(contentService.generateText(request));
    }

    @PostMapping("/generate-image")
    public ResponseEntity<CardImageResponse> generateCardImage(@RequestBody CardTextGenerateRequest request) {
        return ResponseEntity.ok(contentService.generateImage(request));
    }

    @PostMapping("/generate-3d")
    public ResponseEntity<Generate3DModelResponse> generate3DModel(@RequestBody Model3DUserRequest request) {
        return ResponseEntity.ok(model3dContentService.generate3DModel(request));
    }

    @PostMapping("/generate-rulebook")
    public ResponseEntity<RulebookGenerateResponse> generateRulebook(@RequestBody RulebookGenerateRequest request) {
        return ResponseEntity.ok(rulebookContentService.generateRulebook(request));
    }

    @PostMapping("/generate-thumbnail")
    public ResponseEntity<ThumbnailGenerateResponse> generateThumbnail(
            @RequestBody ThumbnailGenerateRequest request) {
        ThumbnailGenerateResponse response = thumbnailContentService.generateThumbnail(request.getContentId());
        return ResponseEntity.ok(response);
    }
}
