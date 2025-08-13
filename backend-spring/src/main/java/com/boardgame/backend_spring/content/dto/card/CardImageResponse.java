package com.boardgame.backend_spring.content.dto.card;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class CardImageResponse {

    @JsonProperty("generated_images")
    private List<CardResult> generatedImages;

    @Data
    public static class CardResult {
        @JsonProperty("contentId")
        private Long contentId;

        @JsonProperty("imageUrl")
        private String imageUrl;
    }
}
