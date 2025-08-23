package com.boardgame.backend_spring.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Refresh Token 재발급 요청 DTO
 */
@Getter
@NoArgsConstructor
public class RefreshRequest {
    private String refreshToken;
}
