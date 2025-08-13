// BalanceController.java
package com.boardgame.backend_spring.balance.controller;

import com.boardgame.backend_spring.balance.dto.BalanceAnalysisDto;
import com.boardgame.backend_spring.balance.dto.BalanceSimulationDto;
import com.boardgame.backend_spring.balance.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/balance")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    /**
     * [신규 추가] projectId를 받아 해당 프로젝트에 속한 규칙 목록을 조회하는 API
     */
    @GetMapping("/rules/{projectId}")
    public ResponseEntity<List<BalanceAnalysisDto.RuleInfo>> getRuleListByProject(@PathVariable Long projectId) {
        List<BalanceAnalysisDto.RuleInfo> rules = balanceService.getRulesByProjectId(projectId);
        return ResponseEntity.ok(rules);
    }

    @PostMapping("/simulate")
    public ResponseEntity<BalanceSimulationDto.Response> runSimulationApi(@RequestBody BalanceSimulationDto.Request request) {
        BalanceSimulationDto.Response response = balanceService.runSimulation(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze")
    public ResponseEntity<BalanceAnalysisDto.Response> getBalanceAnalysisApi(@RequestBody BalanceAnalysisDto.Request request) {
        BalanceAnalysisDto.Response response = balanceService.analyzeBalance(request);
        return ResponseEntity.ok(response);
    }
}