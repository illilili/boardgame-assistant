package com.boardgame.backend_spring.content.service.rulebook;

import com.boardgame.backend_spring.content.dto.rulebook.RulebookGenerateRequest;
import com.boardgame.backend_spring.content.dto.rulebook.RulebookGenerateResponse;

public interface RulebookContentService {
    RulebookGenerateResponse generateRulebook(RulebookGenerateRequest request);
}
