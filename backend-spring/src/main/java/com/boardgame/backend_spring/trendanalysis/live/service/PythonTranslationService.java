package com.boardgame.backend_spring.trendanalysis.live.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Python FastAPI 번역 서비스와 통신하는 Spring 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PythonTranslationService {

    private final RestTemplate restTemplate;

    @Value("${python.api.base-url:http://localhost:8000}")
    private String pythonApiBaseUrl;

    /**
     * 게임 데이터를 Python API로 전송하여 번역
     */
    public void translateGameData(Map<String, Object> gameData) {
        try {
            // 번역할 데이터 추출
            @SuppressWarnings("unchecked")
            List<String> categories = (List<String>) gameData.get("categories");
            
            @SuppressWarnings("unchecked")
            List<String> mechanics = (List<String>) gameData.get("mechanics");
            
            String description = (String) gameData.get("description");

            // 번역할 항목이 없으면 스킵
            if ((categories == null || categories.isEmpty()) && 
                (mechanics == null || mechanics.isEmpty()) && 
                (description == null || description.trim().isEmpty())) {
                log.debug("번역할 데이터가 없음");
                return;
            }

            // 요청 데이터 구성
            Map<String, Object> requestBody = new HashMap<>();
            if (categories != null && !categories.isEmpty()) {
                requestBody.put("categories", categories);
            }
            if (mechanics != null && !mechanics.isEmpty()) {
                requestBody.put("mechanics", mechanics);
            }
            if (description != null && !description.trim().isEmpty()) {
                requestBody.put("description", description);
            }

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Python API 호출
            String url = pythonApiBaseUrl + "/api/translation/game";
            log.debug("Python 번역 API 호출: {}", url);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, request, Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> translationResponse = (Map<String, Object>) response.getBody();
                
                if (Boolean.TRUE.equals(translationResponse.get("success"))) {
                    // 번역 결과를 원본 데이터에 적용
                    applyTranslationResults(gameData, translationResponse);
                    log.debug("번역 적용 완료: gameId={}", gameData.get("id"));
                } else {
                    log.warn("번역 API 응답 실패: {}", translationResponse.get("message"));
                }
            } else {
                log.warn("번역 API 호출 실패: status={}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Python 번역 서비스 호출 실패: {}", e.getMessage(), e);
            // 번역 실패 시에도 원본 데이터는 유지
        }
    }

    /**
     * 번역 결과를 게임 데이터에 적용
     */
    private void applyTranslationResults(Map<String, Object> gameData, Map<String, Object> translationResponse) {
        try {
            // 원본 데이터 백업
            @SuppressWarnings("unchecked")
            List<String> originalCategories = (List<String>) gameData.get("categories");
            
            @SuppressWarnings("unchecked")
            List<String> originalMechanics = (List<String>) gameData.get("mechanics");
            
            String originalDescription = (String) gameData.get("description");

            // 번역된 카테고리 적용
            @SuppressWarnings("unchecked")
            List<String> translatedCategories = (List<String>) translationResponse.get("categories");
            if (translatedCategories != null && !translatedCategories.isEmpty()) {
                gameData.put("categories", translatedCategories);
                gameData.put("categoriesOriginal", originalCategories);
            }

            // 번역된 메카닉 적용
            @SuppressWarnings("unchecked")
            List<String> translatedMechanics = (List<String>) translationResponse.get("mechanics");
            if (translatedMechanics != null && !translatedMechanics.isEmpty()) {
                gameData.put("mechanics", translatedMechanics);
                gameData.put("mechanicsOriginal", originalMechanics);
            }

            // 번역된 설명 적용
            String translatedDescription = (String) translationResponse.get("description");
            if (translatedDescription != null && !translatedDescription.trim().isEmpty()) {
                gameData.put("description", translatedDescription);
                gameData.put("descriptionOriginal", originalDescription);
            }

            log.debug("번역 결과 적용 완료");

        } catch (Exception e) {
            log.error("번역 결과 적용 실패: {}", e.getMessage());
        }
    }

    /**
     * Python 번역 서비스 상태 확인
     */
    public boolean isTranslationServiceHealthy() {
        try {
            String url = pythonApiBaseUrl + "/api/translation/health";
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> healthResponse = (Map<String, Object>) response.getBody();
                return "healthy".equals(healthResponse.get("status"));
            }
            
            return false;
            
        } catch (Exception e) {
            log.warn("번역 서비스 상태 확인 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 배치 번역 (여러 게임 데이터를 한번에 처리)
     */
    public void translateGameDataBatch(List<Map<String, Object>> gamesData) {
        if (gamesData == null || gamesData.isEmpty()) {
            return;
        }

        try {
            // 번역 서비스 상태 확인
            if (!isTranslationServiceHealthy()) {
                log.warn("번역 서비스가 사용 불가능하여 배치 번역 스킵");
                return;
            }

            log.info("배치 번역 시작: {}개 게임", gamesData.size());

            // 배치 크기 제한 (API 부하 고려)
            int batchSize = 5;
            for (int i = 0; i < gamesData.size(); i += batchSize) {
                int end = Math.min(i + batchSize, gamesData.size());
                List<Map<String, Object>> batch = gamesData.subList(i, end);
                
                log.debug("배치 번역 처리: {}-{}/{}", i + 1, end, gamesData.size());
                
                // 개별 번역 처리 (현재는 단일 번역 API 사용)
                for (Map<String, Object> gameData : batch) {
                    translateGameData(gameData);
                    
                    // API 레이트 리밋 고려한 지연
                    try {
                        Thread.sleep(200); // 200ms 대기
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                
                // 배치 간 지연
                if (end < gamesData.size()) {
                    try {
                        Thread.sleep(1000); // 1초 대기
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }

            log.info("배치 번역 완료: {}개 게임", gamesData.size());

        } catch (Exception e) {
            log.error("배치 번역 실패: {}", e.getMessage(), e);
        }
    }

    
    /**
     * 게임 설명만 번역 (단일 설명)
     */
    public String translateDescriptionOnly(String description) {
        try {
            if (description == null || description.trim().isEmpty()) {
                return description;
            }
            
            log.info("게임 설명 번역 시작: {} 글자", description.length());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // JSON 객체로 감싸서 전송
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("description", description);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            String url = pythonApiBaseUrl + "/api/translation/description";
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = (Map<String, Object>) response.getBody();
                if (Boolean.TRUE.equals(result.get("success"))) {
                    String translated = (String) result.get("translated");
                    if (translated != null && !translated.trim().isEmpty()) {
                        log.info("게임 설명 번역 완료: {} 글자", translated.length());
                        return translated;
                    }
                }
            } else {
                log.warn("Python 설명 번역 응답 오류: HTTP {}", response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("게임 설명 번역 중 오류 발생: {}", e.getMessage(), e);
        }
        
        // 실패 시 원본 반환
        return description;
    }

    /**
     * 최적화된 배치 번역 - 중복 제거하여 단일 API 호출
     */
    public List<Map<String, Object>> translateGamesOptimized(List<Map<String, Object>> games) {
        try {
            if (games == null || games.isEmpty()) {
                return games;
            }
            
            log.info("최적화된 배치 번역 시작: {}개 게임", games.size());
            
            Map<String, Object> batchRequest = new HashMap<>();
            batchRequest.put("games", games);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(batchRequest, headers);
            
            String url = pythonApiBaseUrl + "/api/translation/batch-optimized";
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = (Map<String, Object>) response.getBody();
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> translatedGames = (List<Map<String, Object>>) result.get("games");
                
                if (translatedGames != null) {
                    log.info("최적화된 배치 번역 완료: {}개 게임", translatedGames.size());
                    return translatedGames;
                }
            } else {
                log.warn("Python 최적화된 배치 번역 응답 오류: HTTP {}", response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("최적화된 배치 번역 중 오류 발생: {}", e.getMessage(), e);
        }
        
        // 실패 시 원본 반환
        return games;
    }
    
    /**
     * 카테고리 목록만 번역 (TOP3 장르용)
     */
    public List<String> translateCategoriesOnly(List<String> categories) {
        try {
            if (categories == null || categories.isEmpty()) {
                return categories;
            }
            
            log.info("카테고리 번역 시작: {}개 항목", categories.size());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<List<String>> entity = new HttpEntity<>(categories, headers);
            
            String url = pythonApiBaseUrl + "/api/translation/categories";
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = (Map<String, Object>) response.getBody();
                if (Boolean.TRUE.equals(result.get("success"))) {
                    @SuppressWarnings("unchecked")
                    List<String> translated = (List<String>) result.get("translated");
                    if (translated != null && !translated.isEmpty()) {
                        log.info("카테고리 번역 완료: {}개 항목", translated.size());
                        return translated;
                    }
                }
            } else {
                log.warn("Python 카테고리 번역 응답 오류: HTTP {}", response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("카테고리 번역 중 오류 발생: {}", e.getMessage(), e);
        }
        
        // 실패 시 원본 반환
        return categories;
    }
    
    /**
     * 메카닉 목록만 번역 (TOP3 메카닉용)
     */
    public List<String> translateMechanicsOnly(List<String> mechanics) {
        try {
            if (mechanics == null || mechanics.isEmpty()) {
                return mechanics;
            }
            
            log.info("메카닉 번역 시작: {}개 항목", mechanics.size());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<List<String>> entity = new HttpEntity<>(mechanics, headers);
            
            String url = pythonApiBaseUrl + "/api/translation/mechanics";
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = (Map<String, Object>) response.getBody();
                if (Boolean.TRUE.equals(result.get("success"))) {
                    @SuppressWarnings("unchecked")
                    List<String> translated = (List<String>) result.get("translated");
                    if (translated != null && !translated.isEmpty()) {
                        log.info("메카닉 번역 완료: {}개 항목", translated.size());
                        return translated;
                    }
                }
            } else {
                log.warn("Python 메카닉 번역 응답 오류: HTTP {}", response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("메카닉 번역 중 오류 발생: {}", e.getMessage(), e);
        }
        
        // 실패 시 원본 반환
        return mechanics;
    }
}