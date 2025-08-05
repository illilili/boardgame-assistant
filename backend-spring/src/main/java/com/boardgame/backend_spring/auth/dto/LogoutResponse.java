package com.boardgame.backend_spring.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LogoutResponse {
    private String message;
}