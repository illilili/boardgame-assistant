package com.boardgame.backend_spring.auth.service;

import com.boardgame.backend_spring.auth.dto.*;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import com.boardgame.backend_spring.global.error.CustomException;
import com.boardgame.backend_spring.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.boardgame.backend_spring.auth.security.JwtTokenProvider;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public SignupResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .company(request.getCompany())
                .role(User.Role.USER) // 기본 역할 부여
                .build();

        User saved = userRepository.save(user);
        return new SignupResponse(saved.getUserId(), "회원가입이 완료되었습니다.");
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        // JWT 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = "not-implemented"; // refresh는 나중에

        return new LoginResponse(accessToken, refreshToken);
    }

    public LogoutResponse logout(String token) {
        // TODO: 토큰 블랙리스트 처리 또는 무효화 로직 구현
        return new LogoutResponse("로그아웃 되었습니다.");
    }
}
