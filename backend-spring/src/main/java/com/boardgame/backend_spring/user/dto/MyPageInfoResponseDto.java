package com.boardgame.backend_spring.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyPageInfoResponseDto {
    private Long userId;
    private String name;
    private String email;
    private String company;
    private String role;
}
