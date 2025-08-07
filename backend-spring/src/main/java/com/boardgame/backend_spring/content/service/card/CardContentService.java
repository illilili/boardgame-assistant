package com.boardgame.backend_spring.content.service.card;

import com.boardgame.backend_spring.content.dto.card.CardImageResponse;
import com.boardgame.backend_spring.content.dto.card.CardTextGenerateRequest;
import com.boardgame.backend_spring.content.dto.card.CardTextResponse;

public interface CardContentService {
    CardTextResponse generateText(CardTextGenerateRequest request);
    CardImageResponse generateImage(CardTextGenerateRequest request);
}
