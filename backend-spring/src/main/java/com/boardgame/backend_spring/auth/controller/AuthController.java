package com.boardgame.backend_spring.auth.controller;

import com.boardgame.backend_spring.auth.dto.*;
import com.boardgame.backend_spring.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody SignupRequest request) {
        SignupResponse response = authService.signup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(@RequestHeader("Authorization") String token) {
        LogoutResponse response = authService.logout(token);
        return ResponseEntity.ok(response);
    }
}
