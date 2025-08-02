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

     * **[신규 추가]** 프론트엔드에 보여줄 모든 규칙 목록을 조회하는 API

     */

    @GetMapping("/rules")

    public ResponseEntity<List<BalanceAnalysisDto.RuleInfo>> getRuleList() {

        List<BalanceAnalysisDto.RuleInfo> rules = balanceService.getAllRules();

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