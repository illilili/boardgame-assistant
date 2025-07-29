package com.boardgame.backend_spring.test.controller;

import com.boardgame.backend_spring.content.dto.ThumbnailGenerationRequest;
import com.boardgame.backend_spring.content.dto.ThumbnailGenerationResponse;
import com.boardgame.backend_spring.content.service.ContentService;
import com.boardgame.backend_spring.content.service.PythonApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class IntegrationTestController {
    
    private final ContentService contentService;
    private final PythonApiService pythonApiService;
    
    public IntegrationTestController(ContentService contentService, PythonApiService pythonApiService) {
        this.contentService = contentService;
        this.pythonApiService = pythonApiService;
    }
    
    /**
     * Spring → Python 연동 테스트
     */
    @PostMapping("/thumbnail")
    public ResponseEntity<ThumbnailGenerationResponse> testThumbnailGeneration(@RequestBody ThumbnailGenerationRequest request) {
        try {
            ThumbnailGenerationResponse response = contentService.generateThumbnail(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Python API 서버 상태 확인
     */
    @GetMapping("/python-health")
    public ResponseEntity<String> checkPythonHealth() {
        boolean healthy = pythonApiService.isHealthy();
        if (healthy) {
            return ResponseEntity.ok("Python API 서버가 정상 작동 중입니다.");
        } else {
            return ResponseEntity.status(503).body("Python API 서버에 연결할 수 없습니다.");
        }
    }
    
    /**
     * 테스트용 샘플 요청
     */
    @GetMapping("/sample-thumbnail")
    public ResponseEntity<ThumbnailGenerationResponse> generateSampleThumbnail() {
        ThumbnailGenerationRequest request = new ThumbnailGenerationRequest();
        request.setPlanId(1012L);
        request.setProjectTitle("시간 여행자의 모험");
        request.setTheme("중세 판타지");
        request.setStoryline("플레이어는 시간을 조작할 수 있는 마법사가 되어 과거와 현재를 오가며 세상을 구원해야 한다.");
        
        return testThumbnailGeneration(request);
    }
}
