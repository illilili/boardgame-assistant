package com.boardgame.backend_spring.copyright.service;

import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckResponse;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckResponse;

public interface CopyrightService {
    ContentCopyrightCheckResponse checkContentCopyright(ContentCopyrightCheckRequest request);
    PlanCopyrightCheckResponse checkPlanCopyright(PlanCopyrightCheckRequest request);
}
