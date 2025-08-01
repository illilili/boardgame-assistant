package com.boardgame.backend_spring.admin.dto;

import com.boardgame.backend_spring.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserInfoResponseDto {
    private Long userId;
    private String name;
    private String email;
    private String role;
    private boolean accountLocked; // 추가

    public static UserInfoResponseDto from(User user) {
        return new UserInfoResponseDto(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isAccountLocked()  // 추가
        );
    }
}
