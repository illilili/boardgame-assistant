package com.boardgame.backend_spring.user.dto;

import com.boardgame.backend_spring.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String name;
    private String email;
    private String company;
    private String role;

    public static UserResponseDto fromEntity(User user) {
        return new UserResponseDto(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getCompany(),
                user.getRole() != null ? user.getRole().name() : null
        );
    }
}
