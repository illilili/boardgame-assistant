package com.boardgame.backend_spring.content.service;

import com.boardgame.backend_spring.content.dto.card.CardTextRequest;
import com.boardgame.backend_spring.content.dto.card.CardTextResponse;
import com.boardgame.backend_spring.content.dto.card.CardImageResponse;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelRequest;
import com.boardgame.backend_spring.content.dto.model3d.Generate3DModelResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class PythonApiService {
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PYTHON_API_BASE_URL = "http://localhost:8000";

    public CardTextResponse generateText(CardTextRequest request) {
        String url = PYTHON_API_BASE_URL + "/api/content/generate-text";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CardTextRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<CardTextResponse> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, CardTextResponse.class
        );

        return response.getBody();
    }
    public CardImageResponse generateImage(CardTextRequest request) {
        String url = PYTHON_API_BASE_URL + "/api/content/generate-image";


        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<CardTextRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<CardImageResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    CardImageResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("AI 이미지 생성 실패", e);
        }
    }
    public Generate3DModelResponse generate3DModel(Generate3DModelRequest request) {
        String url = PYTHON_API_BASE_URL + "/api/content/generate-3d";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Generate3DModelRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Generate3DModelResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Generate3DModelResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("3D 모델 생성 실패", e);
        }
    }

}
