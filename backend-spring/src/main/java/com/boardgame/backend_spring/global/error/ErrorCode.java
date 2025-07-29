package com.boardgame.backend_spring.global.error;

public enum ErrorCode {
    DUPLICATE_EMAIL("이미 사용 중인 이메일입니다."),
    USER_NOT_FOUND("존재하지 않는 사용자입니다."),
    INVALID_PASSWORD("비밀번호가 일치하지 않습니다.");

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
