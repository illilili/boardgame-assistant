// 파일: component/controller/GenerateComponentController.java
package com.boardgame.backend_spring.component.controller;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import com.boardgame.backend_spring.component.dto.RegenerateComponentDto;
import com.boardgame.backend_spring.component.service.GenerateComponentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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
    // ✨ 상세한 로그를 기록하기 위해 Logger를 추가합니다.
    private static final Logger logger = LoggerFactory.getLogger(GenerateComponentController.class);

    @PostMapping("/generate-components")
    // ✨ 반환 타입을 ResponseEntity<?>로 변경하여 오류 메시지도 담을 수 있게 합니다.
    public ResponseEntity<?> generateComponents(
            @RequestBody GenerateComponentDto.Request request) {
        try {
            GenerateComponentDto.Response response = generateComponentService.generateComponents(request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            // ✨ 데이터가 없는 경우, 404 Not Found와 함께 구체적인 메시지를 반환합니다.
            logger.error("구성요소 생성 실패 (데이터 없음): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // ✨ 그 외 모든 예외에 대해, 서버 로그에 전체 스택 트레이스를 기록하고 500 오류와 메시지를 반환합니다.
            logger.error("구성요소 생성 중 예기치 않은 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @PostMapping("/regenerate-components")
    public ResponseEntity<?> regenerateComponents(
            @RequestBody RegenerateComponentDto.Request request) {
        try {
            GenerateComponentDto.Response response = generateComponentService.regenerateComponents(request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException | IllegalStateException e) {
            // ✨ 잘못된 요청(예: 기존 구성요소 없음)인 경우, 400 Bad Request와 메시지를 반환합니다.
            logger.error("구성요소 재생성 실패 (잘못된 요청): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("구성요소 재생성 중 예기치 않은 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
