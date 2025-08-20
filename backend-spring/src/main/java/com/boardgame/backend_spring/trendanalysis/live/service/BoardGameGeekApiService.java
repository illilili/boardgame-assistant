package com.boardgame.backend_spring.trendanalysis.live.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.stream.Collectors;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.GZIPInputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardGameGeekApiService {
    
    private final RestTemplate restTemplate;
    
    private static final String BGG_API_BASE = "https://boardgamegeek.com/xmlapi2";
    private static final String BGG_HOT_URL = BGG_API_BASE + "/hot?type=boardgame";
    private static final String BGG_THING_URL = BGG_API_BASE + "/thing?id={ids}&stats=1";
    private static final int MAX_HOT_GAMES = 50;
    private static final int DEFAULT_HOT_GAMES = 20;
    
    /**
     * BoardGameGeek 인기 게임 조회 (Hot List) - 기본 20개
     */
    public List<Map<String, Object>> getHotGames() {
        return getHotGames(DEFAULT_HOT_GAMES);
    }
    
    /**
     * BoardGameGeek 인기 게임 조회 (Hot List) - 지정 개수
     * @param limit 조회할 게임 수 (1-50)
     */
    public List<Map<String, Object>> getHotGames(int limit) {
        // 입력 값 검증
        int actualLimit = Math.max(1, Math.min(limit, MAX_HOT_GAMES));
        
        try {
            log.info("BoardGameGeek 인기 게임 {} 개 조회 시작 - URL: {}", actualLimit, BGG_HOT_URL);
            
            // HTTP 헤더 설정 (gzip 압축 요청)
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "BoardGameAssistant/1.0 (contact@boardgame-assistant.com)");
            headers.set("Accept", "text/xml, application/xml");
            headers.set("Accept-Encoding", "gzip, deflate");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<byte[]> response = restTemplate.exchange(
                BGG_HOT_URL, HttpMethod.GET, entity, byte[].class
            );
            
            byte[] responseBytes = response.getBody();
            log.info("BGG Hot API 바이트 응답 받음 - 응답 크기: {} bytes", 
                responseBytes != null ? responseBytes.length : 0);
            
            if (responseBytes != null && responseBytes.length > 0) {
                String xmlContent = decompressGzipResponse(responseBytes);
                
                if (xmlContent != null && xmlContent.startsWith("<?xml")) {
                    log.info("✅ 올바른 XML 응답 받음 - 압축 해제 후 길이: {}", xmlContent.length());
                    log.debug("BGG Hot API XML 응답 시작 200자: {}", 
                        xmlContent.substring(0, Math.min(200, xmlContent.length())));
                    
                    List<Map<String, Object>> hotGames = parseHotGamesXml(xmlContent);
                    log.info("BoardGameGeek 인기 게임 파싱 완료: {} 개 (total: {} 개)", 
                        Math.min(actualLimit, hotGames.size()), hotGames.size());
                    return hotGames.stream().limit(actualLimit).collect(Collectors.toList());
                } else {
                    log.error("❌ XML이 아닌 응답 받음 - 첫 100자: {}", 
                        xmlContent != null ? xmlContent.substring(0, Math.min(100, xmlContent.length())) : "null");
                    return new ArrayList<>();
                }
            } else {
                log.error("❌ 빈 응답 받음");
                return new ArrayList<>();
            }
            
        } catch (RestClientException e) {
            log.error("BoardGameGeek API 호출 실패 - URL: {}", BGG_HOT_URL, e);
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("BoardGameGeek Hot Games 처리 중 예상치 못한 오류", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Gzip 압축된 응답을 압축 해제
     */
    private String decompressGzipResponse(byte[] compressedData) {
        try {
            // 먼저 일반 문자열로 시도 (압축되지 않은 경우)
            String testString = new String(compressedData, "UTF-8");
            if (testString.startsWith("<?xml")) {
                log.debug("응답이 압축되지 않은 XML임");
                return testString;
            }
            
            // Gzip 압축 해제 시도
            log.debug("Gzip 압축 해제 시도 - 압축된 데이터 크기: {} bytes", compressedData.length);
            
            try (ByteArrayInputStream bais = new ByteArrayInputStream(compressedData);
                 GZIPInputStream gzis = new GZIPInputStream(bais);
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                
                byte[] buffer = new byte[1024];
                int len;
                while ((len = gzis.read(buffer)) != -1) {
                    baos.write(buffer, 0, len);
                }
                
                String decompressed = baos.toString("UTF-8");
                log.debug("Gzip 압축 해제 성공 - 해제된 데이터 크기: {} bytes", decompressed.length());
                return decompressed;
                
            } catch (IOException gzipException) {
                log.warn("Gzip 압축 해제 실패, 원본 문자열 반환: {}", gzipException.getMessage());
                // 압축 해제에 실패하면 원본 문자열 반환
                return new String(compressedData, "UTF-8");
            }
            
        } catch (Exception e) {
            log.error("응답 압축 해제 중 오류 발생", e);
            return null;
        }
    }
    
    /**
     * 게임 상세 정보 조회 (재시도 로직 포함)
     */
    public Map<String, Object> getGameDetail(String gameId) {
        int maxRetries = 3;
        int retryDelay = 1000; // 1초
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.info("게임 상세 정보 조회 (시도 {}/{}): {}", attempt, maxRetries, gameId);
                
                String url = BGG_THING_URL.replace("{ids}", gameId) + "&stats=1";
                
                // HTTP 헤더 설정 (gzip 압축 요청)
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "BoardGameAssistant/1.0 (contact@boardgame-assistant.com)");
                headers.set("Accept", "text/xml, application/xml");
                headers.set("Accept-Encoding", "gzip, deflate");
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<byte[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, byte[].class
                );
                
                byte[] responseBytes = response.getBody();
                String xmlContent = decompressGzipResponse(responseBytes);
                
                if (xmlContent != null && xmlContent.startsWith("<?xml") && isValidXmlResponse(xmlContent, gameId)) {
                    // 개별 게임 조회도 parseThingItemXml 사용 (배치 처리와 동일한 파싱 로직)
                    Map<String, Object> gameDetail = parseThingItemXml(xmlContent);
                    if (!gameDetail.isEmpty()) {
                        log.info("게임 상세 정보 조회 성공: {}", gameId);
                        return gameDetail;
                    }
                }
                
                // 응답이 불완전하거나 에러인 경우 재시도
                if (attempt < maxRetries) {
                    log.warn("게임 {} 상세 정보 응답 불완전, {}ms 후 재시도", gameId, retryDelay);
                    Thread.sleep(retryDelay);
                    retryDelay *= 2; // 지수적 백오프
                }
                
            } catch (Exception e) {
                log.error("게임 상세 정보 조회 시도 {} 실패: {}", attempt, gameId, e);
                
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelay);
                        retryDelay *= 2;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return new HashMap<>();
                    }
                } else {
                    log.error("게임 {} 상세 정보 조회 최종 실패", gameId);
                    return new HashMap<>();
                }
            }
        }
        
        return new HashMap<>();
    }
    
    
    
    /**
     * 공개 API: 배치 게임 상세 정보 조회 (컴트롤러에서 호출)
     */
    public Map<String, Object> getGameDetailsBatch(List<String> gameIds) {
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("배치 게임 상세 정보 조회 시작: {} 개 게임", gameIds.size());
            
            Map<String, Map<String, Object>> detailsMap = getGamesDetailsBatchInternal(gameIds);
            
            // 결과 형식 정리
            List<Map<String, Object>> gamesList = new ArrayList<>();
            int successCount = 0;
            int failureCount = 0;
            
            for (String gameId : gameIds) {
                Map<String, Object> gameDetail = detailsMap.get(gameId);
                if (gameDetail != null && !gameDetail.isEmpty()) {
                    gamesList.add(gameDetail);
                    successCount++;
                } else {
                    failureCount++;
                    log.warn("게임 {} 배치 조회 실패", gameId);
                }
            }
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            Map<String, Object> result = new HashMap<>();
            result.put("games", gamesList);
            result.put("totalRequested", gameIds.size());
            result.put("successCount", successCount);
            result.put("failureCount", failureCount);
            result.put("successRate", gameIds.size() > 0 ? (double) successCount / gameIds.size() * 100 : 0);
            result.put("processingTimeMs", processingTime);
            result.put("gameIds", gameIds);
            
            log.info("배치 게임 조회 완료: {} 개 요청, {} 개 성공 ({}%), {} ms", 
                gameIds.size(), successCount, 
                String.format("%.1f", (double) successCount / gameIds.size() * 100), 
                processingTime);
            
            return result;
            
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("배치 게임 조회 실패: {} ms", processingTime, e);
            
            // 실패 시에도 기본 구조 반환
            Map<String, Object> result = new HashMap<>();
            result.put("games", new ArrayList<>());
            result.put("totalRequested", gameIds.size());
            result.put("successCount", 0);
            result.put("failureCount", gameIds.size());
            result.put("successRate", 0.0);
            result.put("processingTimeMs", processingTime);
            result.put("error", e.getMessage());
            
            return result;
        }
    }
    
    /**
     * 내부 구현: Thing API로 게임 상세 정보 일괄 조회 (재시도 및 배치 처리 로직 포함)
     */
    private Map<String, Map<String, Object>> getGamesDetailsBatchInternal(List<String> gameIds) {
        Map<String, Map<String, Object>> detailsMap = new HashMap<>();
        
        if (gameIds.isEmpty()) {
            return detailsMap;
        }
        
        // BGG API 정책: 한번에 너무 많은 ID를 요청하지 않도록 배치 처리
        int batchSize = 20; // 한번에 최대 20개씩 처리
        List<List<String>> batches = new ArrayList<>();
        
        for (int i = 0; i < gameIds.size(); i += batchSize) {
            int end = Math.min(i + batchSize, gameIds.size());
            batches.add(gameIds.subList(i, end));
        }
        
        log.info("Thing API 배치 처리: {} 개 게임을 {} 개 배치로 분할", gameIds.size(), batches.size());
        
        for (int batchIndex = 0; batchIndex < batches.size(); batchIndex++) {
            List<String> batch = batches.get(batchIndex);
            
            try {
                // 배치 간 간격 (BGG API 정책 준수)
                if (batchIndex > 0) {
                    Thread.sleep(2000); // 2초 대기
                }
                
                Map<String, Map<String, Object>> batchResult = processBatch(batch);
                
                // 대형 배치가 완전히 실패한 경우 작은 배치로 재시도
                if (batchResult.isEmpty() && batch.size() > 5) {
                    log.warn("대형 배치 {} 실패, 작은 배치로 재시도: {} 개 게임", batchIndex + 1, batch.size());
                    batchResult = retryWithSmallerBatches(batch);
                }
                
                detailsMap.putAll(batchResult);
                
                log.info("배치 {} 처리 완료: {} 개 게임", batchIndex + 1, batchResult.size());
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Thing API 배치 처리 중단됨", e);
                break;
            } catch (Exception e) {
                log.error("배치 {} 처리 실패", batchIndex + 1, e);
                // 다른 배치는 계속 처리
            }
        }
        
        return detailsMap;
    }
    
    /**
     * 실패한 대형 배치를 작은 배치로 분할하여 재처리
     */
    private Map<String, Map<String, Object>> retryWithSmallerBatches(List<String> failedBatch) {
        Map<String, Map<String, Object>> resultMap = new HashMap<>();
        
        try {
            // 5개씩 작은 배치로 분할
            int smallBatchSize = 5;
            List<List<String>> smallBatches = new ArrayList<>();
            
            for (int i = 0; i < failedBatch.size(); i += smallBatchSize) {
                int end = Math.min(i + smallBatchSize, failedBatch.size());
                smallBatches.add(failedBatch.subList(i, end));
            }
            
            log.info("작은 배치 재시도: {} 개 게임을 {} 개 작은 배치로 분할", 
                failedBatch.size(), smallBatches.size());
            
            for (int i = 0; i < smallBatches.size(); i++) {
                List<String> smallBatch = smallBatches.get(i);
                
                try {
                    // 작은 배치 간 짧은 대기
                    if (i > 0) {
                        Thread.sleep(1000);
                    }
                    
                    Map<String, Map<String, Object>> smallResult = processBatch(smallBatch);
                    resultMap.putAll(smallResult);
                    
                    log.debug("작은 배치 {} 처리 완료: {} 개 게임", i + 1, smallResult.size());
                    
                } catch (Exception e) {
                    log.warn("작은 배치 {} 처리 실패: {}", i + 1, e.getMessage());
                }
            }
            
            log.info("작은 배치 재시도 완료: {} 개 게임 복구", resultMap.size());
            
        } catch (Exception e) {
            log.error("작은 배치 재시도 중 오류 발생", e);
        }
        
        return resultMap;
    }
    
    /**
     * 개별 배치 처리 (재시도 로직 포함)
     */
    private Map<String, Map<String, Object>> processBatch(List<String> gameIds) {
        int maxRetries = 3;
        int retryDelay = 1000; // 1초
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // 게임 ID들을 콤마로 구분하여 일괄 요청
                String idsParam = String.join(",", gameIds);
                String url = BGG_THING_URL.replace("{ids}", idsParam) + "&stats=1";
                
                log.debug("Thing API 호출 시도 {}/{}: {} 개 게임", attempt, maxRetries, gameIds.size());
                
                String response = restTemplate.getForObject(url, String.class);
                
                if (response != null && !response.isEmpty() && !response.contains("error")) {
                    // BGG에서 자주 발생하는 "정보 없음" 응답 감지
                    if (response.contains("Your request for information was accepted") || 
                        response.contains("too many requests") ||
                        response.length() < 200) {
                        log.warn("BGG API 응답이 일시적 정보 없음 상태, 재시도 필요");
                    } else {
                        Map<String, Map<String, Object>> result = parseThingApiResponse(response);
                        // 최소한의 게임 정보가 파싱되었는지 확인 (전체 요청의 20% 이상)
                        int minExpected = Math.max(1, gameIds.size() / 5);
                        if (result.size() >= minExpected) {
                            log.info("배치 파싱 성공: {}/{} 게임 파싱", result.size(), gameIds.size());
                            return result;
                        } else {
                            log.warn("배치 파싱 불완전: {}/{} 게임만 파싱됨 (최소 {} 필요)", 
                                result.size(), gameIds.size(), minExpected);
                        }
                    }
                }
                
                // 응답이 비어있거나 에러인 경우 재시도
                if (attempt < maxRetries) {
                    log.warn("Thing API 응답 불완전, {}ms 후 재시도", retryDelay);
                    Thread.sleep(retryDelay);
                    retryDelay *= 2; // 지수적 백오프
                }
                
            } catch (Exception e) {
                log.error("Thing API 호출 시도 {} 실패", attempt, e);
                
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelay);
                        retryDelay *= 2;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    if (e instanceof InterruptedException) {
                        Thread.currentThread().interrupt();
                    }
                    throw new RuntimeException(e);
                }
            }
        }
        
        return new HashMap<>();
    }
    
    /**
     * Thing API XML 응답 파싱 (다중 게임)
     */
    private Map<String, Map<String, Object>> parseThingApiResponse(String xmlResponse) {
        Map<String, Map<String, Object>> gamesMap = new HashMap<>();
        
        try {
            log.debug("Thing API XML 응답 파싱 시작, 길이: {}", xmlResponse.length());
            
            // XML 응답이 비어있거나 불완전한 경우 감지
            if (xmlResponse.length() < 100 || !xmlResponse.contains("<item")) {
                log.warn("Thing API XML 응답이 불완전: 길이={}, item 태그 존재={}", 
                    xmlResponse.length(), xmlResponse.contains("<item"));
                log.debug("불완전한 XML 응답 내용: {}", 
                    xmlResponse.length() > 500 ? xmlResponse.substring(0, 500) + "..." : xmlResponse);
                return gamesMap;
            }
            
            // 정규표현식으로 item 태그를 더 정확하게 추출
            java.util.regex.Pattern itemPattern = java.util.regex.Pattern.compile(
                "<item[^>]*type=\"boardgame\"[^>]*id=\"([^\"]+)\"[^>]*>(.*?)</item>", 
                java.util.regex.Pattern.DOTALL
            );
            java.util.regex.Matcher matcher = itemPattern.matcher(xmlResponse);
            
            int matchCount = 0;
            while (matcher.find()) {
                matchCount++;
                String gameId = matcher.group(1);
                String itemXml = matcher.group(0); // 전체 item 태그
                
                log.debug("게임 {} 파싱 시작", gameId);
                
                Map<String, Object> gameDetails = parseThingItemXml(itemXml);
                if (!gameDetails.isEmpty()) {
                    gamesMap.put(gameId, gameDetails);
                    log.debug("게임 {} 파싱 완료", gameId);
                } else {
                    log.warn("게임 {} 파싱 결과가 비어있음", gameId);
                }
            }
            
            // 매치 개수가 0인 경우 디버그 정보 추가
            if (matchCount == 0) {
                log.warn("Thing API XML에서 item 태그를 찾지 못함");
                log.debug("XML 응답 샘플 (처음 1000자): {}", 
                    xmlResponse.length() > 1000 ? xmlResponse.substring(0, 1000) + "..." : xmlResponse);
            }
            
            log.info("Thing API 파싱 완료: {} 개 게임 매치, {} 개 게임 파싱 성공", matchCount, gamesMap.size());
            
        } catch (Exception e) {
            log.error("Thing API XML 파싱 실패", e);
        }
        
        return gamesMap;
    }
    
    /**
     * 단일 Thing API 아이템 XML 파싱
     */
    private Map<String, Object> parseThingItemXml(String itemXml) {
        Map<String, Object> gameDetails = new HashMap<>();
        
        try {
            // 기본 정보
            String id = extractAttribute(itemXml, "id");
            if (id != null) gameDetails.put("id", id);
            
            // 게임명 (primary name 우선)
            String primaryName = extractTagWithAttribute(itemXml, "name", "type", "primary");
            if (primaryName == null) {
                primaryName = extractTagContent(itemXml, "name");
            }
            if (primaryName != null) gameDetails.put("name", primaryName);
            
            // 기본 게임 정보
            parseBasicGameInfo(itemXml, gameDetails);
            
            // 평점 및 통계
            parseGameStatistics(itemXml, gameDetails);
            
            // 카테고리 및 메카닉
            parseGameCategories(itemXml, gameDetails);
            
            // 게임 설명
            String description = extractTagContent(itemXml, "description");
            if (description != null) {
                gameDetails.put("description", cleanHtmlTags(description));
            }
            
            // Python AI 번역은 별도 처리 (성능 최적화)
            // pythonTranslationService.translateGameData(gameDetails);
            
        } catch (Exception e) {
            log.error("Thing 아이템 XML 파싱 실패", e);
        }
        
        return gameDetails;
    }
    
    /**
     * 기본 게임 정보 파싱
     */
    private void parseBasicGameInfo(String itemXml, Map<String, Object> gameDetails) {
        // 출시년도
        String yearPublished = extractTagValue(itemXml, "yearpublished");
        if (yearPublished != null) {
            try {
                gameDetails.put("yearPublished", Integer.parseInt(yearPublished));
            } catch (NumberFormatException ignored) {}
        }
        
        // 플레이어 수
        String minPlayers = extractTagValue(itemXml, "minplayers");
        String maxPlayers = extractTagValue(itemXml, "maxplayers");
        if (minPlayers != null) {
            try {
                gameDetails.put("minPlayers", Integer.parseInt(minPlayers));
            } catch (NumberFormatException ignored) {}
        }
        if (maxPlayers != null) {
            try {
                gameDetails.put("maxPlayers", Integer.parseInt(maxPlayers));
            } catch (NumberFormatException ignored) {}
        }
        
        // 플레이 시간
        String playingTime = extractTagValue(itemXml, "playingtime");
        String minPlayTime = extractTagValue(itemXml, "minplaytime");
        String maxPlayTime = extractTagValue(itemXml, "maxplaytime");
        
        if (playingTime != null) {
            try {
                gameDetails.put("playingTime", Integer.parseInt(playingTime));
            } catch (NumberFormatException ignored) {}
        }
        if (minPlayTime != null) {
            try {
                gameDetails.put("minPlayTime", Integer.parseInt(minPlayTime));
            } catch (NumberFormatException ignored) {}
        }
        if (maxPlayTime != null) {
            try {
                gameDetails.put("maxPlayTime", Integer.parseInt(maxPlayTime));
            } catch (NumberFormatException ignored) {}
        }
        
        // 최소 연령
        String minAge = extractTagValue(itemXml, "minage");
        if (minAge != null) {
            try {
                gameDetails.put("minAge", Integer.parseInt(minAge));
            } catch (NumberFormatException ignored) {}
        }
        
        // 이미지 정보
        String image = extractTagContent(itemXml, "image");
        String thumbnail = extractTagContent(itemXml, "thumbnail");
        if (image != null) gameDetails.put("image", image);
        if (thumbnail != null) gameDetails.put("thumbnail", thumbnail);
    }
    
    /**
     * 게임 통계 정보 파싱 (평점, 복잡도, 순위 등)
     */
    private void parseGameStatistics(String itemXml, Map<String, Object> gameDetails) {
        // 평점 정보
        String averageRating = extractTagValue(itemXml, "average");
        String bayesAverageRating = extractTagValue(itemXml, "bayesaverage");
        
        if (averageRating != null) {
            try {
                gameDetails.put("averageRating", Double.parseDouble(averageRating));
            } catch (NumberFormatException ignored) {}
        }
        
        if (bayesAverageRating != null) {
            try {
                gameDetails.put("bayesAverageRating", Double.parseDouble(bayesAverageRating));
            } catch (NumberFormatException ignored) {}
        }
        
        // 복잡도
        String averageWeight = extractTagValue(itemXml, "averageweight");
        if (averageWeight != null) {
            try {
                gameDetails.put("averageWeight", Double.parseDouble(averageWeight));
            } catch (NumberFormatException ignored) {}
        }
        
        // 사용자 평가 수
        String usersRated = extractTagValue(itemXml, "usersrated");
        if (usersRated != null) {
            try {
                gameDetails.put("usersRated", Integer.parseInt(usersRated));
            } catch (NumberFormatException ignored) {}
        }
        
        // 소유자 수
        String owned = extractTagValue(itemXml, "owned");
        if (owned != null) {
            try {
                gameDetails.put("owned", Integer.parseInt(owned));
            } catch (NumberFormatException ignored) {}
        }
        
        // 위시리스트 수
        String wishing = extractTagValue(itemXml, "wishing");
        if (wishing != null) {
            try {
                gameDetails.put("wishing", Integer.parseInt(wishing));
            } catch (NumberFormatException ignored) {}
        }
        
        // BGG 순위 (전체 게임 순위)
        String bggRank = extractTagValue(itemXml, "rank");
        if (bggRank != null && !bggRank.equals("Not Ranked")) {
            try {
                gameDetails.put("bggRank", Integer.parseInt(bggRank));
            } catch (NumberFormatException ignored) {}
        }
        
        // 표준 편차
        String stddev = extractTagValue(itemXml, "stddev");
        if (stddev != null) {
            try {
                gameDetails.put("ratingStdDev", Double.parseDouble(stddev));
            } catch (NumberFormatException ignored) {}
        }
    }
    
    /**
     * 게임 카테고리 및 메카닉 파싱
     */
    private void parseGameCategories(String itemXml, Map<String, Object> gameDetails) {
        // 카테고리 추출
        List<String> categories = extractLinkedItems(itemXml, "boardgamecategory");
        if (!categories.isEmpty()) {
            gameDetails.put("categories", categories);
        }
        
        // 메카닉 추출
        List<String> mechanics = extractLinkedItems(itemXml, "boardgamemechanic");
        if (!mechanics.isEmpty()) {
            gameDetails.put("mechanics", mechanics);
        }
        
        // 디자이너
        List<String> designers = extractLinkedItems(itemXml, "boardgamedesigner");
        if (!designers.isEmpty()) {
            gameDetails.put("designers", designers);
        }
        
        // 출판사
        List<String> publishers = extractLinkedItems(itemXml, "boardgamepublisher");
        if (!publishers.isEmpty()) {
            gameDetails.put("publishers", publishers);
        }
    }
    
    
    /**
     * 링크된 아이템들 추출 (카테고리, 메카닉, 디자이너 등)
     */
    private List<String> extractLinkedItems(String xml, String linkType) {
        List<String> items = new ArrayList<>();
        
        try {
            String pattern = "<link[^>]*type=\"" + linkType + "\"[^>]*value=\"([^\"]+)\"[^>]*/>";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(xml);
            
            while (m.find()) {
                String value = m.group(1);
                if (value != null && !value.trim().isEmpty()) {
                    items.add(value.trim());
                }
            }
        } catch (Exception e) {
            log.warn("링크 아이템 추출 실패: {}", linkType, e);
        }
        
        return items;
    }
    
    /**
     * 속성이 있는 태그에서 내용 추출
     */
    private String extractTagWithAttribute(String xml, String tagName, String attrName, String attrValue) {
        String pattern = "<" + tagName + "[^>]*" + attrName + "=\"" + attrValue + "\"[^>]*value=\"([^\"]+)\"[^>]*/>";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(xml);
        return m.find() ? m.group(1) : null;
    }
    
    /**
     * value 속성에서 값 추출
     */
    private String extractTagValue(String xml, String tagName) {
        String pattern = "<" + tagName + "[^>]*value=\"([^\"]+)\"[^>]*/>";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(xml);
        return m.find() ? m.group(1) : null;
    }
    
    /**
     * HTML 태그 제거
     */
    private String cleanHtmlTags(String htmlText) {
        if (htmlText == null) return null;
        return htmlText.replaceAll("<[^>]+>", "").trim();
    }
    
    
    
    
    /**
     * Hot Games XML 파싱
     */
    private List<Map<String, Object>> parseHotGamesXml(String xmlResponse) {
        List<Map<String, Object>> games = new ArrayList<>();
        
        try {
            // 간단한 XML 파싱 (정규식 사용)
            String[] items = xmlResponse.split("<item ");
            
            for (int i = 1; i < items.length; i++) {
                String item = items[i];
                
                Map<String, Object> game = new HashMap<>();
                
                // ID 추출
                String id = extractAttribute(item, "id");
                if (id != null) game.put("id", id);
                
                // 순위 추출
                String rank = extractAttribute(item, "rank");
                if (rank != null) game.put("rank", Integer.parseInt(rank));
                
                // 이름 추출
                String name = extractTagContent(item, "name");
                if (name != null) game.put("name", name);
                
                // 출시년도 추출
                String yearPublished = extractTagContent(item, "yearpublished");
                if (yearPublished != null) {
                    try {
                        game.put("yearPublished", Integer.parseInt(yearPublished));
                    } catch (NumberFormatException ignored) {}
                }
                
                // 썸네일 추출
                String thumbnail = extractTagContent(item, "thumbnail");
                if (thumbnail != null) {
                    game.put("thumbnail", thumbnail);
                }
                
                games.add(game);
            }
            
        } catch (Exception e) {
            log.error("Hot Games XML 파싱 실패", e);
        }
        
        return games;
    }
    
    
    /**
     * XML에서 속성값 추출
     */
    private String extractAttribute(String xml, String attributeName) {
        String pattern = attributeName + "=\"([^\"]+)\"";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(xml);
        return m.find() ? m.group(1) : null;
    }
    
    /**
     * XML에서 태그 내용 추출
     */
    private String extractTagContent(String xml, String tagName) {
        String pattern = "<" + tagName + "[^>]*>([^<]+)</" + tagName + ">";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(xml);
        if (m.find()) {
            return m.group(1);
        }
        
        // value 속성으로도 시도
        pattern = "<" + tagName + "[^>]*value=\"([^\"]+)\"[^>]*/?>";
        p = java.util.regex.Pattern.compile(pattern);
        m = p.matcher(xml);
        return m.find() ? m.group(1) : null;
    }
    
    /**
     * BGG API XML 응답 유효성 검증
     */
    private boolean isValidXmlResponse(String xmlResponse, String gameId) {
        if (xmlResponse == null || xmlResponse.trim().isEmpty()) {
            log.warn("빈 XML 응답: gameId={}", gameId);
            return false;
        }
        
        // XML 선언 확인
        if (!xmlResponse.contains("<?xml")) {
            log.warn("XML 선언 없음: gameId={}", gameId);
            return false;
        }
        
        // 기본 구조 확인
        if (!xmlResponse.contains("<items") || !xmlResponse.contains("</items>")) {
            log.warn("items 태그 누락: gameId={}", gameId);
            return false;
        }
        
        // 게임 ID와 일치하는 item 태그 확인
        String itemPattern = "<item[^>]*id=\"" + gameId + "\"[^>]*>";
        if (!java.util.regex.Pattern.compile(itemPattern).matcher(xmlResponse).find()) {
            log.warn("요청한 게임 ID가 응답에 없음: gameId={}", gameId);
            return false;
        }
        
        return true;
    }
}