package com.boardgame.backend_spring.content.service;

import com.boardgame.backend_spring.content.dto.card.CardTextRequest;
import com.boardgame.backend_spring.content.dto.card.CardTextResponse;
import com.boardgame.backend_spring.content.dto.card.CardImageResponse;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelRequest;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DTaskResponse;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookRequest;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookGenerateResponse;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateRequest;
import com.boardgame.backend_spring.content.dto.thumbnail.ThumbnailGenerateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PythonApiService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${fastapi.service.url:http://localhost:8000}")
    private String fastApiBaseUrl;

    // 카드 텍스트 생성
    public CardTextResponse generateText(CardTextRequest request) {
        String url = fastApiBaseUrl + "/api/content/generate-text";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<CardTextRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<CardTextResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity, CardTextResponse.class);
        return response.getBody();
    }

    // 카드 이미지 생성
    public CardImageResponse generateImage(CardTextRequest request) {
        String url = fastApiBaseUrl + "/api/content/generate-image";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<CardTextRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<CardImageResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity, CardImageResponse.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("AI 이미지 생성 실패", e);
        }
    }

    // 3D 모델 비동기 요청 (taskId 반환)
    public Generate3DTaskResponse generate3DModelTask(Generate3DModelRequest request) {
        String url = fastApiBaseUrl + "/api/content/generate-3d";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Generate3DModelRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Generate3DTaskResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity, Generate3DTaskResponse.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("3D 모델 비동기 생성 요청 실패", e);
        }
    }

    // 3D 모델 상태 확인
    public Map<String, Object> get3DStatus(String taskId) {
        String url = fastApiBaseUrl + "/api/content/generate-3d/status/" + taskId;
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("3D 모델 상태 조회 실패", e);
        }
    }

    // 룰북 생성
    public RulebookGenerateResponse generateRulebook(RulebookRequest request) {
        String url = fastApiBaseUrl + "/api/content/generate-rulebook";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            request.getComponents().forEach(component -> {
                if (component.getQuantity() == null) component.setQuantity("");
            });
            HttpEntity<RulebookRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<RulebookGenerateResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity, RulebookGenerateResponse.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("룰북 생성 실패", e);
        }
    }

    // 썸네일 생성
    public ThumbnailGenerateResponse generateThumbnail(ThumbnailGenerateRequest request) {
        String url = fastApiBaseUrl + "/api/content/generate-thumbnail";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ThumbnailGenerateRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<ThumbnailGenerateResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity, ThumbnailGenerateResponse.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("썸네일 생성 실패", e);
        }
    }
}
