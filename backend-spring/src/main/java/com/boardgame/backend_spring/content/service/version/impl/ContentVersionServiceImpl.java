package com.boardgame.backend_spring.content.service.version.impl;

import com.boardgame.backend_spring.content.dto.version.*;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.entity.ContentVersion;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.repository.ContentVersionRepository;
import com.boardgame.backend_spring.content.service.version.ContentVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentVersionServiceImpl implements ContentVersionService {

    private final ContentRepository contentRepository;
    private final ContentVersionRepository versionRepository;

    @Override
    public ContentSaveResponse saveVersion(ContentSaveRequest request) {
        // 1) 콘텐츠 조회
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        // 2) 다음 버전 번호 계산 (PK는 content.getId())
        int nextNo = versionRepository.findMaxVersionNo(content.getContentId()) + 1;

        // 3) 스냅샷 저장
        ContentVersion v = new ContentVersion();
        v.setContent(content);                       // ← setContent 사용 가능
        v.setVersionNo(nextNo);
        v.setNote(request.getNote());
        v.setCreatedAt(LocalDateTime.now());
        v.setData(content.getContentData());         // 현재 콘텐츠 내용을 스냅샷으로

        ContentVersion saved = versionRepository.save(v);

        // 4) 응답
        return ContentSaveResponse.builder()
                .versionId(saved.getVersionId())
                .contentId(content.getContentId())          // ← getId()로 변경
                .versionNo(saved.getVersionNo())
                .note(saved.getNote())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public ContentVersionListResponse listVersions(Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));

        var versions = versionRepository.findByContentOrderByVersionNoDesc(content)
                .stream()
                .map(v -> ContentVersionSummary.builder()
                        .versionId(v.getVersionId())
                        .versionNo(v.getVersionNo())
                        .note(v.getNote())
                        .createdAt(v.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ContentVersionListResponse.builder()
                .contentId(contentId)
                .versions(versions)
                .build();
    }

    @Override
    public void deleteVersion(Long versionId) {
        versionRepository.deleteById(versionId);
    }

    @Override
    public void rollback(Long contentId, Long versionId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다."));
        ContentVersion v = versionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠 버전입니다."));

        // 해당 콘텐츠의 버전인지 검증
        if (!v.getContent().getContentId().equals(contentId)) { // ← getContent().getId()
            throw new IllegalStateException("해당 콘텐츠의 버전이 아닙니다.");
        }

        // 콘텐츠 데이터 되돌리기
        content.setContentData(v.getData());
        contentRepository.save(content);
    }
}
