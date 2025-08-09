// GameRuleController.java
package com.boardgame.backend_spring.rule.controller;


import com.boardgame.backend_spring.rule.dto.GameRuleRequest;
import com.boardgame.backend_spring.rule.dto.GameRuleResponse;
import com.boardgame.backend_spring.rule.service.GameRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans") // 규칙 전용 API 경로
@RequiredArgsConstructor
public class GameRuleController {

    private final GameRuleService gameRuleService;

    @PostMapping("/generate-rule") // 전체 경로: /api/plans/generate-rule
    public ResponseEntity<?> generateRulesApi(@RequestBody GameRuleRequest request) {
        try {
            GameRuleResponse response = gameRuleService.generateRules(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }
}