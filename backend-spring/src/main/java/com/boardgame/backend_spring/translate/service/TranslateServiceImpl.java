package com.boardgame.backend_spring.translate.service;

import com.boardgame.backend_spring.component.enumtype.ComponentStatus;
import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.entity.ContentVersion;
import com.boardgame.backend_spring.content.repository.ContentRepository;
import com.boardgame.backend_spring.content.repository.ContentVersionRepository;
import com.boardgame.backend_spring.translate.dto.*;
import com.boardgame.backend_spring.translate.entity.Translation;
import com.boardgame.backend_spring.translate.repository.TranslationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import com.boardgame.backend_spring.task.dto.TaskListResponseDto;
import com.boardgame.backend_spring.task.dto.TaskComponentDto;
import com.boardgame.backend_spring.task.dto.SubTaskDto;
import com.boardgame.backend_spring.task.service.TaskService;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TranslateServiceImpl implements TranslateService {

    private final TranslationRepository translationRepository;
    private final ContentRepository contentRepository;
    private final ContentVersionRepository contentVersionRepository;
    private final TaskService taskService;

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${fastapi.service.url}")
    private String fastapiBaseUrl;  // e.g., http://localhost:8000

    @Override
    @Transactional
    public TranslationResponse requestTranslations(Long publisherUserId, TranslationRequest dto) {
        Content content = contentRepository.findById(dto.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 contentId: " + dto.getContentId()));

        List<Translation> result = new ArrayList<>();

        for (String lang : dto.getTargetLanguages()) {
            int maxIter = translationRepository.findMaxIteration(content.getContentId(), lang);

            Translation t = new Translation();
            t.setContent(content);
            t.setTargetLanguage(lang);
            t.setIteration(maxIter + 1);
            t.setFeedback(dto.getFeedback());
            t.setStatus(Translation.Status.REQUESTED);
            translationRepository.save(t);

            // 동기 호출: FastAPI 응답에서 번역 결과(JSON 문자열)를 받아 즉시 저장
            String translatedData = dispatchToFastApiSync(t.getTranslationId());

            t.setTranslatedData(translatedData);
            t.setStatus(Translation.Status.IN_PROGRESS);

            result.add(t);
        }

        return new TranslationResponse(
                content.getContentId(),
                result.stream().map(TranslationItemDto::from).toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranslationItemDto> getTranslationsByContent(Long contentId) {
        return translationRepository.findByContent_ContentIdOrderByCreatedAtDesc(contentId)
                .stream().map(TranslationItemDto::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranslationItemDto> getTranslationsByContent(Long contentId, boolean latestOnly) {
        List<Translation> all = translationRepository
                .findByContent_ContentIdOrderByCreatedAtDesc(contentId);

        if (!latestOnly) {
            return all.stream().map(TranslationItemDto::from).toList();
        }

        // 언어별 최초(=가장 최신) 한 건만 담기
        Map<String, Translation> perLang = new LinkedHashMap<>();
        for (Translation t : all) {
            String lang = t.getTargetLanguage();
            if (!perLang.containsKey(lang)) {
                perLang.put(lang, t);
            }
        }
        return perLang.values().stream().map(TranslationItemDto::from).toList();
    }

    // 동기 방식으로 바뀌었지만, 인터페이스 호환용으로 남겨둠.
    // 외부에서 직접 호출되면 동일하게 동기 번역을 수행하고 완료 상태로 만든다.
    @Override
    @Transactional
    public void dispatchToFastApi(Long translationId) {
        Translation t = translationRepository.findById(translationId)
                .orElseThrow(() -> new IllegalArgumentException("translationId not found: " + translationId));

        String translatedData = dispatchToFastApiSync(translationId);
        t.setStatus(Translation.Status.COMPLETED);
        t.setTranslatedData(translatedData);
    }

    @Override
    @Transactional
    public TranslationItemDto handleCallback(TranslationCallbackRequest cb) {
        // 동기식으로 바뀌면 실사용하지 않지만, 엔드포인트가 남아있을 수 있어 안전하게 유지
        Translation t = translationRepository.findById(cb.getTranslationId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 translationId: " + cb.getTranslationId()));

        if ("COMPLETED".equalsIgnoreCase(cb.getStatus())) {
            t.setStatus(Translation.Status.COMPLETED);
            t.setTranslatedData(cb.getTranslatedData());
        } else if ("FAILED".equalsIgnoreCase(cb.getStatus())) {
            t.setStatus(Translation.Status.FAILED);
            t.setTranslatedData(null);
        } else {
            throw new IllegalArgumentException("status 값은 COMPLETED 또는 FAILED 여야 합니다.");
        }

        return TranslationItemDto.from(t);
    }

    @Override
    @Transactional
    public TranslationItemDto completeTranslation(Long translationId) {
        Translation t = translationRepository.findById(translationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 translationId: " + translationId));

        // 번역 결과가 없으면 완료 막기(선택)
        if (t.getTranslatedData() == null || t.getTranslatedData().isBlank()) {
            throw new IllegalStateException("번역 결과가 없어서 완료할 수 없습니다.");
        }

        t.setStatus(Translation.Status.COMPLETED);
        return TranslationItemDto.from(t);
    }

    /**
     * FastAPI 동기 호출: 번역 결과(JSON 문자열)를 반환한다.
     * 실패 시 예외 발생.
     */
    private String dispatchToFastApiSync(Long translationId) {
        Translation t = translationRepository.findById(translationId)
                .orElseThrow(() -> new IllegalArgumentException("translationId not found: " + translationId));

        Content c = t.getContent();
        String type = c.getContentType();
        String raw = c.getContentData();

        // 룰북이고 현재 값이 URL / {submitted:{fileUrl}} 형태면 → 최신 "텍스트" 스냅샷으로 대체
        if ("rulebook".equalsIgnoreCase(type) && looksLikeUrlOrPdfJson(raw)) {
            for (ContentVersion v : contentVersionRepository.findByContentOrderByVersionNoDesc(c)) {
                if (!looksLikeUrlOrPdfJson(v.getData())) {
                    raw = v.getData();
                    break;
                }
            }
        }

        // 번역기(FastAPI) 호환 포맷으로 정규화
        Map<String, Object> contentData = normalizeContentDataForTranslate(c, raw);

        // Map.of는 null 불가 → HashMap 사용
        Map<String, Object> contentBody = new HashMap<>();
        contentBody.put("contentId", c.getContentId());
        contentBody.put("contentType", type);
        contentBody.put("contentData", contentData);

        Map<String, Object> body = new HashMap<>();
        body.put("translationId", t.getTranslationId());
        body.put("targetLanguage", t.getTargetLanguage());
        if (t.getFeedback() != null) body.put("feedback", t.getFeedback());
        body.put("content", contentBody);

        String url = fastapiBaseUrl + "/api/translate/process";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // FastAPI 동기 응답 모델: { "translationId": 123, "translatedData": "<json string>" }
            ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.POST, entity, Map.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                Object td = resp.getBody().getOrDefault("translatedData", null);
                if (td == null) {
                    throw new RuntimeException("FastAPI 응답에 translatedData 누락");
                }
                if (td instanceof String s) return s;
                // 혹시 dict로 오면 문자열로 직렬화해서 저장
                return objectMapper.writeValueAsString(td);
            } else {
                throw new RuntimeException("FastAPI 응답 비정상: " + resp.getStatusCode());
            }
        } catch (Exception e) {
            t.setStatus(Translation.Status.FAILED);
            throw new RuntimeException("FastAPI 동기 번역 실패: " + e.getMessage(), e);
        }
    }

    // ====== 헬퍼들 ======

    /** contentData가 '단순 URL 문자열'이거나, {submitted:{fileUrl}}만 있고 source가 없으면 true */
    private boolean looksLikeUrlOrPdfJson(String s) {
        if (s == null) return false;
        String x = s.trim();
        if (x.startsWith("http://") || x.startsWith("https://")) return true;
        try {
            Map<?, ?> m = objectMapper.readValue(x, Map.class);
            Object submitted = m.get("submitted");
            Object source = m.get("source");
            if (submitted instanceof Map<?, ?> sub) {
                Object url = ((Map<?, ?>) submitted).get("fileUrl");
                boolean hasUrl = (url instanceof String)
                        && (((String) url).startsWith("http://") || ((String) url).startsWith("https://"));
                boolean hasSource = (source instanceof Map<?, ?>) && !((Map<?, ?>) source).isEmpty();
                return hasUrl && !hasSource;
            }
        } catch (Exception ignore) {}
        return false;
    }

    /** 번역기 호환 포맷으로 contentData를 정규화 */
    private Map<String, Object> normalizeContentDataForTranslate(Content c, String raw) {
        String type = c.getContentType();
        if (raw == null) raw = "";

        // 이미 JSON이면 그대로 Map으로
        try {
            return objectMapper.readValue(raw, Map.class);
        } catch (Exception ignore) { /* 문자열이면 아래로 진행 */ }

        // 룰북: 순수 텍스트면 번역기 스키마로 래핑
        if ("rulebook".equalsIgnoreCase(type)) {
            Map<String, Object> src = new HashMap<>();
            src.put("format", "text");
            src.put("text", raw);

            Map<String, Object> m = new HashMap<>();
            m.put("type", "rulebook");
            m.put("source", src);
            return m;
        }

        // 카드 텍스트: 엔티티 필드 + 본문(text) 최소 구성
        if ("card_text".equalsIgnoreCase(type)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", "card_text");
            if (c.getName() != null) m.put("name", c.getName());
            if (c.getEffect() != null) m.put("effect", c.getEffect());
            if (c.getDescription() != null) m.put("description", c.getDescription());
            if (!raw.isBlank()) m.put("text", raw);
            return m;
        }

        // 기타 타입: 우선 원문 문자열만 전달
        Map<String, Object> m = new HashMap<>();
        m.put("raw", raw);
        return m;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranslationCandidateDto> listTranslationCandidates(Long projectId) {
        TaskListResponseDto taskList = taskService.getTaskListByProject(projectId);

        List<TranslationCandidateDto> candidates = new ArrayList<>();
        for (TaskComponentDto comp : taskList.getComponents()) {
            String status = comp.getStatusSummary();
            if (ComponentStatus.APPROVED.name().equalsIgnoreCase(status) || "승인".equals(status)) {
                for (SubTaskDto sub : comp.getSubTasks()) {
                    if ("text".equalsIgnoreCase(sub.getType())) {
                        candidates.add(TranslationCandidateDto.builder()
                                .contentId(sub.getContentId())
                                .name(comp.getTitle())
                                .componentType(comp.getType())
                                .status(comp.getStatusSummary())
                                .build());
                    }
                }
            }
        }
        return candidates;
    }
}
