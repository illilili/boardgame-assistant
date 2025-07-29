package com.boardgame.backend_spring.user.controller;

import com.boardgame.backend_spring.user.dto.MyPageInfoResponseDto;
import com.boardgame.backend_spring.user.dto.UserCreateRequestDto;
import com.boardgame.backend_spring.user.dto.UserResponseDto;
import com.boardgame.backend_spring.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.boardgame.backend_spring.user.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

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
     * @param dto 사용자 생성 요청 DTO
     * @return 생성된 사용자 정보
     */
    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@RequestBody UserCreateRequestDto dto) {
        return ResponseEntity.ok(userService.createUser(dto));
    }

    /**
     * 사용자 단건 조회 API
     * @param userId 사용자 ID
     * @return 사용자 정보
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 마이페이지 정보 조회 API
     * @param userId 사용자 ID
     * @return 사용자 마이페이지 정보 (기획안 수, 프로젝트 수 등 포함 가능)
     */
    @GetMapping("/mypage")
    public ResponseEntity<MyPageInfoResponseDto> getMyPage(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getMyPageInfo(user.getUserId()));
    }
}
