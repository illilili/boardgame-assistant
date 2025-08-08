package com.boardgame.backend_spring.global.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),
    ACCOUNT_LOCKED(HttpStatus.UNAUTHORIZED, "계정이 잠겨있습니다. 관리자에게 문의하세요."),
    TERMS_NOT_AGREED(HttpStatus.BAD_REQUEST, "약관에 동의하지 않았습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
