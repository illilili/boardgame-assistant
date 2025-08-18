// com/boardgame/backend_spring/auth/dto/SignupRequest.java

package com.boardgame.backend_spring.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String company;

    // 약관 동의 여부
    private boolean agreedToTerms;
}