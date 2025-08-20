package com.boardgame.backend_spring.trendanalysis.common.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrendResponse<T> {
    private String status;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private boolean cached;
    
    public static <T> TrendResponse<T> success(T data) {
        return TrendResponse.<T>builder()
                .status("success")
                .message("데이터 조회 성공")
                .data(data)
                .timestamp(LocalDateTime.now())
                .cached(false)
                .build();
    }
    
    public static <T> TrendResponse<T> success(T data, String message) {
        return TrendResponse.<T>builder()
                .status("success")
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .cached(false)
                .build();
    }
    
    public static <T> TrendResponse<T> cached(T data) {
        return TrendResponse.<T>builder()
                .status("success")
                .message("캐시된 데이터 반환")
                .data(data)
                .timestamp(LocalDateTime.now())
                .cached(true)
                .build();
    }
}