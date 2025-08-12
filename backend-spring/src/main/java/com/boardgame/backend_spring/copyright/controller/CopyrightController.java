package com.boardgame.backend_spring.copyright.controller;

import com.boardgame.backend_spring.copyright.dto.CopyrightCheckRequestDto;
import com.boardgame.backend_spring.copyright.dto.CopyrightCheckResponseDto;
import com.boardgame.backend_spring.copyright.service.CopyrightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 기획안 저작권 검사 컨트롤러
 */
@RestController
@RequestMapping("/api/copyright")
@RequiredArgsConstructor
public class CopyrightController {

    private final CopyrightService copyrightService;

    /**
     * 저작권 검사 실행 (FastAPI 연동 후 DB 저장)
     */
    @PostMapping("/check")
    public ResponseEntity<CopyrightCheckResponseDto> checkCopyright(
            @RequestBody CopyrightCheckRequestDto request) {
        return ResponseEntity.ok(copyrightService.checkCopyright(request));
    }

    /**
     * 저장된 저작권 검사 결과 조회
     */
    @GetMapping("/{planId}")
    public ResponseEntity<CopyrightCheckResponseDto> getCopyrightResult(
            @PathVariable Long planId) {
        return ResponseEntity.ok(copyrightService.getCopyrightResult(planId));
    }
}
