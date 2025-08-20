package com.boardgame.backend_spring.content.controller;

import com.boardgame.backend_spring.content.dto.version.*;
import com.boardgame.backend_spring.content.entity.ContentVersion;
import com.boardgame.backend_spring.content.service.version.ContentVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentVersionController {

    private final ContentVersionService versionService;

    // 버전 저장
    @PostMapping("/version/save")
    public ResponseEntity<ContentSaveResponse> save(@RequestBody ContentSaveRequest request) {
        return ResponseEntity.ok(versionService.saveVersion(request));
    }

    // 버전 목록 조회
    @GetMapping("/{contentId}/versions")
    public ResponseEntity<ContentVersionListResponse> list(@PathVariable Long contentId) {
        return ResponseEntity.ok(versionService.listVersions(contentId));
    }

    // 버전 삭제
    @DeleteMapping("/version/{versionId}")
    public ResponseEntity<Void> delete(@PathVariable Long versionId) {
        versionService.deleteVersion(versionId);
        return ResponseEntity.noContent().build();
    }

    // (옵션) 롤백
    @PostMapping("/{contentId}/rollback/{versionId}")
    public ResponseEntity<Void> rollback(@PathVariable Long contentId, @PathVariable Long versionId) {
        versionService.rollback(contentId, versionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/version/{versionId}")
    public ResponseEntity<ContentVersionDetailResponse> detail(@PathVariable Long versionId) {
        return ResponseEntity.ok(versionService.getVersionDetail(versionId));
    }
}
