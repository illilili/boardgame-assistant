package com.boardgame.backend_spring.admin.controller;

import com.boardgame.backend_spring.admin.dto.UnlockUserRequestDto;
import com.boardgame.backend_spring.admin.dto.UnlockUserResponseDto;
import com.boardgame.backend_spring.admin.dto.UserInfoResponseDto;
import com.boardgame.backend_spring.global.error.CustomException;
import com.boardgame.backend_spring.global.error.ErrorCode;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class UserManageController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserInfoResponseDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserInfoResponseDto> response = users.stream()
                .map(UserInfoResponseDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unlock-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UnlockUserResponseDto> unlockUser(@RequestBody UnlockUserRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.setAccountLocked(false);
        user.setFailedLoginCount(0);
        userRepository.save(user);

        return ResponseEntity.ok(new UnlockUserResponseDto("계정이 해제되었습니다."));
    }
}
