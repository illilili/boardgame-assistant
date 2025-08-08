package com.boardgame.backend_spring.user.dto;

import com.boardgame.backend_spring.user.entity.User.Role;
import lombok.Getter;

@Getter
public class UserCreateRequestDto {
    private String email;
    private String password;
    private String name;
    private String company;
    private Role role;
}
