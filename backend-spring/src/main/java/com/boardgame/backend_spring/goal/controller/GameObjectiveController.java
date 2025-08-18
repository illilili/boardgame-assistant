package com.boardgame.backend_spring.goal.controller;

import com.boardgame.backend_spring.goal.dto.GameObjectiveRequest;
import com.boardgame.backend_spring.goal.dto.GameObjectiveResponse;
import com.boardgame.backend_spring.goal.service.GameObjectiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/plans")
// @RequiredArgsConstructor // 삭제
public class GameObjectiveController {

    private final GameObjectiveService gameObjectiveService;

    // 생성자 직접 추가
    @Autowired
    public GameObjectiveController(GameObjectiveService gameObjectiveService) {
        this.gameObjectiveService = gameObjectiveService;
    }

    @PostMapping("/generate-goal")
    public ResponseEntity<?> generateObjectiveApi(@RequestBody GameObjectiveRequest request) {
        try {
            // 동기 방식으로 서비스 호출 후 성공 시 200 OK와 함께 결과 반환
            GameObjectiveResponse response = gameObjectiveService.generateGoal(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // 서비스에서 예외 발생 시 500 Internal Server Error와 함께 에러 메시지 반환
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }
}