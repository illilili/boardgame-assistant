package com.boardgame.backend_spring.content.dto.card;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class CardTextResponse {
    @JsonProperty("generated_texts")
    private List<CardResult> generatedTexts;

    @Data
    public static class CardResult {
        @JsonProperty("contentId")
        private Long contentId;

        private String name;
        private String effect;
        private String text;
    }
}
