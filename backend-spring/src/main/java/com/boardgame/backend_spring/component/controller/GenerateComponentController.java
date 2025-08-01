package com.boardgame.backend_spring.component.controller;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import com.boardgame.backend_spring.component.service.GenerateComponentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            return ResponseEntity.internalServerError().body(null);
        }
    }
}