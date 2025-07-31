package com.boardgame.backend_spring.regenerate.controller;

import com.boardgame.backend_spring.regenerate.dto.RegenerateDto;
import com.boardgame.backend_spring.regenerate.service.RegenerateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans")
public class RegenerateController {

    private final RegenerateService regenerateService;

    @Autowired
    public RegenerateController(RegenerateService regenerateService) {
        this.regenerateService = regenerateService;
    }

    @PostMapping("/regenerate-concept")
    public ResponseEntity<?> regenerateConcept(@RequestBody RegenerateDto.ConceptRequest request) {
        try {
            return ResponseEntity.ok(regenerateService.regenerateConcept(request));
        } catch (Exception e) { return ResponseEntity.internalServerError().body(e.getMessage()); }
    }

    @PostMapping("/regenerate-components")
    public ResponseEntity<?> regenerateComponents(@RequestBody RegenerateDto.ComponentsRequest request) {
        try {
            return ResponseEntity.ok(regenerateService.regenerateComponents(request));
        } catch (Exception e) { return ResponseEntity.internalServerError().body(e.getMessage()); }
    }

    @PostMapping("/regenerate-rule")
    public ResponseEntity<?> regenerateRule(@RequestBody RegenerateDto.RuleRequest request) {
        try {
            return ResponseEntity.ok(regenerateService.regenerateRule(request));
        } catch (Exception e) { return ResponseEntity.internalServerError().body(e.getMessage()); }
    }
}