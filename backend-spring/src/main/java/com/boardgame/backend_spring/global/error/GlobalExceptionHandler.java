package com.boardgame.backend_spring.global.error;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<?> handleCustomException(CustomException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", ex.getErrorCode().getStatus().value());
        error.put("error", ex.getErrorCode().getStatus().getReasonPhrase());
        error.put("message", ex.getErrorCode().getMessage());

        return ResponseEntity.status(ex.getErrorCode().getStatus()).body(error);
    }
}
