// 파일: component/controller/GenerateComponentController.java
package com.boardgame.backend_spring.component.controller;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import com.boardgame.backend_spring.component.dto.RegenerateComponentDto;
import com.boardgame.backend_spring.component.service.GenerateComponentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class GenerateComponentController {

    private final GenerateComponentService generateComponentService;

    @PostMapping("/generate-components")
    public ResponseEntity<GenerateComponentDto.Response> generateComponents(
            @RequestBody GenerateComponentDto.Request request) {
        try {
            GenerateComponentDto.Response response = generateComponentService.generateComponents(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 신규 추가: 구성요소 재생성 엔드포인트
    @PostMapping("/regenerate-components")
    public ResponseEntity<GenerateComponentDto.Response> regenerateComponents(
            @RequestBody RegenerateComponentDto.Request request) {
        try {
            GenerateComponentDto.Response response = generateComponentService.regenerateComponents(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}