package com.boardgame.backend_spring.translate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class TranslateResultResponse {
    private Long contentId;
    private List<TranslationItemDto> items;
}
