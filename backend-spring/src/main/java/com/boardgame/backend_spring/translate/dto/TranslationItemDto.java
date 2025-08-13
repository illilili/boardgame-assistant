package com.boardgame.backend_spring.translate.dto;

import com.boardgame.backend_spring.translate.entity.Translation;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 번역 단건 요약 DTO
 */
@Getter
@AllArgsConstructor
public class TranslationItemDto {
    private Long translationId;
    private Long contentId;
    private String targetLanguage;
    private String status;
    private Integer iteration;
    private String feedback;
    private String translatedData;
    private LocalDateTime updatedAt;

    public static TranslationItemDto from(Translation t) {
        return new TranslationItemDto(
                t.getTranslationId(),
                t.getContent().getContentId(),
                t.getTargetLanguage(),
                t.getStatus().name(),
                t.getIteration(),
                t.getFeedback(),
                t.getTranslatedData(),
                t.getUpdatedAt()
        );
    }
}
