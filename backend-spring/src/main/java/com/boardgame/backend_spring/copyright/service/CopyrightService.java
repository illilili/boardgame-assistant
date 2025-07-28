package com.boardgame.backend_spring.copyright.service;

import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckResponse;

public interface CopyrightService {
    ContentCopyrightCheckResponse checkContentCopyright(ContentCopyrightCheckRequest request);
}
