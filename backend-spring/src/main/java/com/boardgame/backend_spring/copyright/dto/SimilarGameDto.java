package com.boardgame.backend_spring.copyright.dto;

import lombok.Data;
import java.util.List;

/**
 * FastAPI에서 반환하는 유사 게임 정보 DTO
 */
@Data
public class SimilarGameDto {
    private String title;
    private double similarityScore;
    private List<String> overlappingElements;
    private String bggLink;
}
