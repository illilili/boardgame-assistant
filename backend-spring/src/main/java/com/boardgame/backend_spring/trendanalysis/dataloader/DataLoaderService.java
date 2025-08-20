package com.boardgame.backend_spring.trendanalysis.dataloader;

import com.boardgame.backend_spring.trendanalysis.original.entity.BoardgameTrend;
import com.boardgame.backend_spring.trendanalysis.original.repository.BoardgameTrendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 로컬 파일 시스템에서 CSV 파일을 읽어와 데이터베이스에 로드하는 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataLoaderService {

    private final BoardgameTrendRepository repository;

    @Value("${app.dataloader.enabled:true}")
    private boolean dataLoaderEnabled;

    @Value("${app.dataloader.local-csv-file-path:../backend-python/pricing/data/bgg_data.csv}")
    private String localCsvFilePath;

    @Value("${app.dataloader.batch-size:100}")
    private int batchSize;

    @Value("${app.dataloader.clear-existing-data:true}")
    private boolean clearExistingData;

    @Value("${app.dataloader.skip-duplicates:true}")
    private boolean skipDuplicates;

    @Value("${app.dataloader.max-records:0}")
    private int maxRecords; // 0 = unlimited

    /**
     * 애플리케이션 시작 시 CSV 데이터 로드
     */
    @EventListener(ApplicationReadyEvent.class)
    public void loadDataOnStartup() {
        if (!dataLoaderEnabled) {
            log.info("⏭️ 데이터 로더가 비활성화되어 있습니다. app.dataloader.enabled=false");
            return;
        }

        log.info("🚀 애플리케이션 시작 시 로컬 CSV 데이터 로드 시작");
        loadBoardgameDataFromLocal();
    }


    /**
     * 로컬 파일에서 보드게임 데이터 로드
     */
    @Transactional
    public void loadBoardgameDataFromLocal() {
        try {
            log.info("📊 로컬 CSV 데이터 로드 시작: 파일={}", localCsvFilePath);

            // 1. 파일 존재 확인
            Path filePath = Paths.get(localCsvFilePath);
            if (!Files.exists(filePath)) {
                log.error("❌ 로컬 CSV 파일이 존재하지 않습니다: {}", localCsvFilePath);
                return;
            }

            // 2. 기존 데이터 삭제 (옵션)
            if (clearExistingData) {
                long existingCount = repository.count();
                if (existingCount > 0) {
                    log.info("🗑️ 기존 데이터 삭제 중... ({} 개 레코드)", existingCount);
                    repository.deleteAll();
                    log.info("✅ 기존 데이터 삭제 완료");
                }
            }

            // 3. 로컬 파일에서 CSV 파일 읽기
            log.info("📖 로컬에서 CSV 파일 읽기 시작");
            List<String> csvLines;
            try {
                // 먼저 UTF-8로 시도
                csvLines = Files.readAllLines(filePath, StandardCharsets.UTF_8);
            } catch (java.nio.charset.MalformedInputException e) {
                log.warn("⚠️ UTF-8 인코딩 실패, ISO-8859-1로 재시도");
                csvLines = Files.readAllLines(filePath, StandardCharsets.ISO_8859_1);
            }

            if (csvLines.isEmpty()) {
                log.warn("⚠️ CSV 파일이 비어있습니다");
                return;
            }

            // 4. 헤더 확인
            String headerLine = csvLines.get(0);
            log.info("📋 CSV 헤더: {}", headerLine);

            // 5. 데이터 파싱 및 저장
            AtomicInteger processedCount = new AtomicInteger(0);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger errorCount = new AtomicInteger(0);

            log.info("🔄 CSV 데이터 파싱 및 저장 시작 (총 {} 라인)", csvLines.size() - 1);

            for (int i = 1; i < csvLines.size(); i++) { // 헤더 제외
                if (maxRecords > 0 && successCount.get() >= maxRecords) {
                    log.info("📊 최대 레코드 수에 도달했습니다: {}", maxRecords);
                    break;
                }

                String line = csvLines.get(i);
                
                // 빈 라인 건너뛰기
                if (line == null || line.trim().isEmpty()) {
                    continue;
                }
                
                try {
                    BoardgameTrend trend = parseCsvLine(line);
                    
                    if (trend != null) {
                        // 중복 확인 (옵션)
                        if (skipDuplicates && repository.existsByGameId(trend.getGameId())) {
                            continue; // 중복 건너뛰기
                        }

                        repository.save(trend);
                        successCount.incrementAndGet();
                    }

                } catch (Exception e) {
                    log.warn("⚠️ 라인 파싱 실패 (라인 {}): {}", i + 1, e.getMessage());
                    errorCount.incrementAndGet();
                }

                processedCount.incrementAndGet();

                // 진행상황 로그
                if (processedCount.get() % 500 == 0) {
                    log.info("📊 진행상황: {}/{} 처리됨, 성공: {}, 오류: {}", 
                        processedCount.get(), csvLines.size() - 1, successCount.get(), errorCount.get());
                }
            }

            // 6. 결과 요약
            log.info("✅ 로컬 CSV 데이터 로드 완료!");
            log.info("📊 최종 통계:");
            log.info("   - 총 처리된 라인: {}", processedCount.get());
            log.info("   - 성공적으로 저장: {}", successCount.get());
            log.info("   - 오류 발생: {}", errorCount.get());
            log.info("   - 데이터베이스 총 레코드: {}", repository.count());

        } catch (IOException e) {
            log.error("❌ 로컬 CSV 파일 읽기 중 오류 발생", e);
            throw new RuntimeException("로컬 CSV 데이터 로드 실패", e);
        } catch (Exception e) {
            log.error("❌ 로컬 CSV 데이터 로드 중 오류 발생", e);
            throw new RuntimeException("로컬 CSV 데이터 로드 실패", e);
        }
    }

    /**
     * CSV 라인을 BoardgameTrend 엔티티로 파싱
     * 실제 CSV 형식: game_id,name,amazon_price,Geek Rating,Average Rating,Description,image,thumbnail,min_players,max_players,min_age,average_weight,category,mechanic,type,components
     */
    private BoardgameTrend parseCsvLine(String csvLine) {
        try {
            // 더 강건한 CSV 파싱
            String[] fields = parseCsvFields(csvLine);

            // 최소 필수 필드 확인 (game_id, name)
            if (fields.length < 2 || cleanField(fields[0]) == null || cleanField(fields[1]) == null) {
                return null; // 필수 필드가 없으면 무시
            }

            BoardgameTrend trend = new BoardgameTrend();

            // 필수 필드 매핑
            trend.setGameId(cleanField(fields[0]));                    // game_id
            trend.setName(cleanField(fields[1]));                      // name
            
            // 선택적 필드들 (안전하게 파싱)
            if (fields.length > 3) {
                trend.setGeekRating(parseBigDecimal(cleanField(fields[3]))); // Geek Rating
            }
            if (fields.length > 4) {
                trend.setAverageRating(parseBigDecimal(cleanField(fields[4]))); // Average Rating
            }
            if (fields.length > 8) {
                trend.setMinPlayers(parseInteger(cleanField(fields[8])));   // min_players
            }
            if (fields.length > 9) {
                trend.setMaxPlayers(parseInteger(cleanField(fields[9])));   // max_players
            }
            if (fields.length > 10) {
                // min_age 파싱 (14+ 형태에서 숫자만 추출)
                String minAgeStr = cleanField(fields[10]);
                if (minAgeStr != null) {
                    String ageNum = minAgeStr.replaceAll("[^0-9]", "");
                    trend.setMinAge(ageNum.isEmpty() ? null : Integer.parseInt(ageNum));
                }
            }
            if (fields.length > 11) {
                trend.setAverageWeight(parseBigDecimal(cleanField(fields[11]))); // average_weight
            }
            if (fields.length > 12) {
                // JSON 배열 필드들을 단순 텍스트로 변환
                trend.setCategories(cleanJsonArrayField(cleanField(fields[12])));  // category
            }
            if (fields.length > 13) {
                trend.setMechanics(cleanJsonArrayField(cleanField(fields[13])));   // mechanic
            }
            
            // 년도 정보가 없으므로 null로 설정
            trend.setYearPublished(null);
            trend.setPlayingTime(null);

            return trend;

        } catch (Exception e) {
            log.warn("⚠️ CSV 라인 파싱 오류: {}", e.getMessage());
            return null;
        }
    }

    /**
     * CSV 필드 정리 (따옴표 제거, 공백 처리)
     */
    private String cleanField(String field) {
        if (field == null) return null;
        
        field = field.trim();
        
        // 따옴표 제거
        if (field.startsWith("\"") && field.endsWith("\"")) {
            field = field.substring(1, field.length() - 1);
        }
        
        // 빈 문자열을 null로 처리
        return field.isEmpty() ? null : field;
    }

    /**
     * 문자열을 BigDecimal로 안전하게 변환
     */
    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 문자열을 Integer로 안전하게 변환
     */
    private Integer parseInteger(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * JSON 배열 형태의 문자열을 단순 텍스트로 변환
     * 예: "['Age of Reason', 'Economic']" → "Age of Reason, Economic"
     */
    private String cleanJsonArrayField(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "[]"; // 빈 JSON 배열
        }
        
        try {
            // ['..', '..'] 형태의 문자열을 파싱
            String cleaned = value.trim();
            
            // 대괄호 제거
            if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
                cleaned = cleaned.substring(1, cleaned.length() - 1);
            }
            
            // 작은따옴표로 묶인 항목들을 추출
            if (cleaned.contains("'")) {
                // 정규식으로 '...' 패턴 추출
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("'([^']*)'");
                java.util.regex.Matcher matcher = pattern.matcher(cleaned);
                java.util.List<String> items = new java.util.ArrayList<>();
                
                while (matcher.find()) {
                    String item = matcher.group(1).trim();
                    if (!item.isEmpty()) {
                        items.add(item);
                    }
                }
                
                if (!items.isEmpty()) {
                    // JSON 배열 형식으로 변환
                    java.util.List<String> jsonItems = new java.util.ArrayList<>();
                    for (String item : items) {
                        // 이스케이프 처리
                        item = item.replace("\\", "\\\\").replace("\"", "\\\"");
                        jsonItems.add("\"" + item + "\"");
                    }
                    return "[" + String.join(", ", jsonItems) + "]";
                }
            }
            
            // 파싱에 실패한 경우 빈 배열 반환
            return "[]";
            
        } catch (Exception e) {
            log.warn("⚠️ JSON 배열 필드 파싱 실패: {}, 원본 값: {}", e.getMessage(), value);
            return "[]"; // 실패 시 빈 배열
        }
    }

    /**
     * 더 강건한 CSV 필드 파싱 
     * 복잡한 따옴표, 쉼표, 대괄호 처리
     */
    private String[] parseCsvFields(String csvLine) {
        java.util.List<String> fields = new java.util.ArrayList<>();
        StringBuilder currentField = new StringBuilder();
        boolean inQuotes = false;
        boolean inBrackets = false;
        
        for (int i = 0; i < csvLine.length(); i++) {
            char c = csvLine.charAt(i);
            
            if (c == '"' && !inBrackets) {
                inQuotes = !inQuotes;
                currentField.append(c);
            } else if (c == '[' && !inQuotes) {
                inBrackets = true;
                currentField.append(c);
            } else if (c == ']' && !inQuotes) {
                inBrackets = false;
                currentField.append(c);
            } else if (c == ',' && !inQuotes && !inBrackets) {
                fields.add(currentField.toString());
                currentField = new StringBuilder();
            } else {
                currentField.append(c);
            }
        }
        
        // 마지막 필드 추가
        fields.add(currentField.toString());
        
        return fields.toArray(new String[0]);
    }

    /**
     * 수동으로 데이터 로드 (API 호출용)
     */
    public void reloadDataFromLocal() {
        log.info("🔄 수동 로컬 데이터 리로드 요청");
        loadBoardgameDataFromLocal();
    }
}