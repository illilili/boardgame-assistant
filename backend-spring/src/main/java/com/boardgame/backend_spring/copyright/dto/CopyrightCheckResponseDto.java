package com.boardgame.backend_spring.copyright.dto;

import lombok.Data;
import java.util.List;

/**
 * FastAPI 응답 DTO
 */
@Data
public class CopyrightCheckResponseDto {
    private Long planId;
    private String riskLevel;
    private List<SimilarGameDto> similarGames;
    private String analysisSummary;
}
