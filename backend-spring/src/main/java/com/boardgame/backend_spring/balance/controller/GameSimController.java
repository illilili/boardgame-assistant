package com.boardgame.backend_spring.balance.controller;


import com.boardgame.backend_spring.balance.dto.BalanceDto;
import com.boardgame.backend_spring.balance.dto.SimulationDto;
import com.boardgame.backend_spring.balance.service.GameSimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api") // 시뮬레이션 전용 API 경로
public class GameSimController {

    private final GameSimService gameSimService;

    @Autowired
    public GameSimController(GameSimService gameSimService) {
        this.gameSimService = gameSimService;
    }

    @PostMapping("/simulate/rule-test")
    public ResponseEntity<?> runSimulationApi(@RequestBody SimulationDto.SimulateRequest request) {
        try {
            SimulationDto.SimulateResponse response = gameSimService.runSimulation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/feedback/balance")
    public ResponseEntity<?> getBalanceFeedbackApi() {
        try {
            BalanceDto.FeedbackResponse response = gameSimService.getBalanceFeedback();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
