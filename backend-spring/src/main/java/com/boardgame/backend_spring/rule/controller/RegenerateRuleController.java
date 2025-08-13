package com.boardgame.backend_spring.rule.controller;

import com.boardgame.backend_spring.rule.dto.RegenerateRuleDto;
import com.boardgame.backend_spring.rule.service.RegenerateRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class RegenerateRuleController {

    private final RegenerateRuleService regenerateRuleService;

    @PostMapping("/regenerate-rule")
    public ResponseEntity<?> regenerateRule(@RequestBody RegenerateRuleDto.Request request) {
        try {
            return ResponseEntity.ok(regenerateRuleService.regenerateRule(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}