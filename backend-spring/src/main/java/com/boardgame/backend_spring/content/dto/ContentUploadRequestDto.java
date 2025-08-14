package com.boardgame.backend_spring.content.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 파일 URL 업로드 요청 DTO
 */
@Getter
@Setter
public class ContentUploadRequestDto {
    private String contentData; // S3 업로드 URL
}
