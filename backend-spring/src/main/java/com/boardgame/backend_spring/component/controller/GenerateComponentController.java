package com.boardgame.backend_spring.component.controller;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import com.boardgame.backend_spring.component.service.GenerateComponentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/plans") // 프론트엔드가 호출할 API 경로
public class GenerateComponentController {

    private final GenerateComponentService generateComponentService;

    @Autowired
    public GenerateComponentController(GenerateComponentService generateComponentService) {
        this.generateComponentService = generateComponentService;
    }

    // 구성요소 생성 API 엔드포인트
    @PostMapping("/generate-components")
    public ResponseEntity<GenerateComponentDto.Response> generateComponents(
            @RequestBody GenerateComponentDto.Request request) {
        try {
            GenerateComponentDto.Response response = generateComponentService.generateComponents(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // FastAPI 호출 중 에러 발생 시, 에러 메시지를 포함한 500 응답 반환
            return ResponseEntity.internalServerError().body(null);
        }
    }
}