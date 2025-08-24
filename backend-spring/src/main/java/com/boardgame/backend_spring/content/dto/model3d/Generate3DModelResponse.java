package com.boardgame.backend_spring.content.dto.model3d;
import com.fasterxml.jackson.annotation.JsonProperty;


import lombok.Getter;
import lombok.Setter;

/**
 * FastAPI로부터 3D 모델 생성 응답을 받을 때 사용하는 DTO
 */
@Getter
@Setter
public class Generate3DModelResponse {
    @JsonProperty("contentId")
    private Long contentId;

    private String name;

//    @JsonProperty("preview_url")
//    private String previewUrl;

    @JsonProperty("refined_url")
    private String refinedUrl;

    private String status;
}
