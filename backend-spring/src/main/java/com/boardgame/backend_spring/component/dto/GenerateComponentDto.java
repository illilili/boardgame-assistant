package com.boardgame.backend_spring.component.dto;

import java.util.List;

// 데이터 전송 객체(DTO) 정의
public class GenerateComponentDto {

    // 1. React -> Spring Boot 요청 DTO
    public record Request(int planId) {}

    // 2. Spring Boot -> React 응답 DTO
    public record Response(
            int componentId,
            List<ComponentItem> components
    ) {}

    // 3. 구성요소 항목 DTO
    public record ComponentItem(
            String type,
            String name,
            String effect,
            String visualType
    ) {}
}