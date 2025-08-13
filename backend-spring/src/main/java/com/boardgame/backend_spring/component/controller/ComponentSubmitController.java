package com.boardgame.backend_spring.component.controller;

import com.boardgame.backend_spring.component.service.ComponentSubmitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 컴포넌트 제출 API 컨트롤러
 * - 모든 SubTask가 완료된 컴포넌트를 제출 상태(PENDING_REVIEW)로 변경
 */
@RestController
@RequestMapping("/api/components")
@RequiredArgsConstructor
public class ComponentSubmitController {

    private final ComponentSubmitService componentSubmitService;

    /**
     * 컴포넌트 제출
     * @param componentId 제출할 컴포넌트 ID
     */
    @PostMapping("/{componentId}/submit")
    public ResponseEntity<Void> submitComponent(@PathVariable Long componentId) {
        componentSubmitService.submit(componentId);
        return ResponseEntity.ok().build();
    }
}
