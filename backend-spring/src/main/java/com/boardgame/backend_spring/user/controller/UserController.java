package com.boardgame.backend_spring.user.controller;

import com.boardgame.backend_spring.user.dto.MyPageInfoResponseDto;
import com.boardgame.backend_spring.user.dto.UserCreateRequestDto;
import com.boardgame.backend_spring.user.dto.UserResponseDto;
import com.boardgame.backend_spring.user.dto.DeveloperSummaryDto;
import com.boardgame.backend_spring.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.boardgame.backend_spring.user.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

/**
 * 사용자(User) 관련 API 컨트롤러
 * - 사용자 정보 조회, 마이페이지, 테스트용 사용자 생성 등
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * (임시) 사용자 생성 API
     * dto 사용자 생성 요청 DTO
     * 생성된 사용자 정보
     */
    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@RequestBody UserCreateRequestDto dto) {
        return ResponseEntity.ok(userService.createUser(dto));
    }

    /**
     * 사용자 단건 조회 API(임시)
     * userId 사용자 ID
     * 사용자 정보
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 마이페이지 정보 조회 API
     * userId 사용자 ID
     * 사용자 마이페이지 정보 (안에 뭐뭐 넣을지 아직 미정)
     */
    @GetMapping("/mypage")
    public ResponseEntity<MyPageInfoResponseDto> getMyPage(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getMyPageInfo(user.getUserId()));
    }

    @GetMapping("/developers")
    public ResponseEntity<List<DeveloperSummaryDto>> getDevelopers(@AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.PUBLISHER) {
            return ResponseEntity.status(403).build();  // Forbidden
        }
        return ResponseEntity.ok(userService.getAllDevelopers());
    }
}
