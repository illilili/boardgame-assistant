package com.boardgame.backend_spring.content.dto.thumbnail;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ThumbnailGenerateResponse {

    @JsonProperty("contentId")
    private Long contentId;

    @JsonProperty("thumbnailUrl")
    private String thumbnailUrl;
}
