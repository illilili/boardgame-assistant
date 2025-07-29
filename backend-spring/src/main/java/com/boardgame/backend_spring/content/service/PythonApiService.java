package com.boardgame.backend_spring.content.service;

import com.boardgame.backend_spring.content.dto.ThumbnailGenerationRequest;
import com.boardgame.backend_spring.content.dto.ThumbnailGenerationResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PythonApiService {
    
    private final RestTemplate restTemplate;
    private static final String PYTHON_API_BASE_URL = "http://localhost:8000";
    
    public PythonApiService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Python API를 호출하여 썸네일 이미지 생성
     */
    public ThumbnailGenerationResponse generateThumbnail(ThumbnailGenerationRequest request) {
        String url = PYTHON_API_BASE_URL + "/api/content/generate-thumbnail";
        
        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // 요청 엔티티 생성
        HttpEntity<ThumbnailGenerationRequest> entity = new HttpEntity<>(request, headers);
        
        try {
            // Python API 호출
            ResponseEntity<ThumbnailGenerationResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                ThumbnailGenerationResponse.class
            );
            
            return response.getBody();
        } catch (Exception e) {
            // 오류 처리
            throw new RuntimeException("Python API 호출 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * Python API 서버 상태 확인
     */
    public boolean isHealthy() {
        try {
            String url = PYTHON_API_BASE_URL + "/docs"; // FastAPI 기본 docs 엔드포인트
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
}
