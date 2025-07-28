package com.boardgame.backend_spring.auth.security;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class JwtTokenProvider {

    // secretKey, token 만료시간 등 설정 필요

    public String createAccessToken(String userEmail) {
        // TODO: 실제 JWT 발급 로직으로 교체
        return "mock-access-token-" + UUID.randomUUID();
    }

    public String createRefreshToken() {
        return "mock-refresh-token-" + UUID.randomUUID();
    }

    public String getUserEmailFromToken(String token) {
        // TODO: JWT 디코딩해서 userEmail 추출하는 로직으로 대체
        return "mock@example.com";
    }

    public boolean validateToken(String token) {
        // TODO: 토큰 유효성 검증 로직 추가
        return token != null && token.startsWith("mock");
    }
}
