package com.boardgame.backend_spring.trendanalysis.dataloader;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 로컬 CSV 데이터 로더 관리 API
 */
@RestController
@RequestMapping("/api/admin/dataloader")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class DataLoaderController {

    private final DataLoaderService dataLoaderService;

    /**
     * 로컬에서 CSV 데이터 수동 로드
     * POST /api/admin/dataloader/reload
     */
    @PostMapping("/reload")
    public ResponseEntity<Map<String, Object>> reloadDataFromLocal() {
        log.info("🔄 로컬 CSV 데이터 수동 리로드 API 호출");
        
        try {
            dataLoaderService.reloadDataFromLocal();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "로컬 CSV 데이터 리로드가 성공적으로 완료되었습니다");
            response.put("timestamp", System.currentTimeMillis());
            
            log.info("✅ 로컬 CSV 데이터 수동 리로드 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ 로컬 CSV 데이터 수동 리로드 실패", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "로컬 CSV 데이터 리로드 중 오류 발생: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 데이터 로더 상태 확인
     * GET /api/admin/dataloader/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDataLoaderStatus() {
        log.info("📊 데이터 로더 상태 확인 API 호출");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "active");
        response.put("description", "로컬 파일 기반 CSV 데이터 로더");
        response.put("localFileIntegration", "enabled");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}