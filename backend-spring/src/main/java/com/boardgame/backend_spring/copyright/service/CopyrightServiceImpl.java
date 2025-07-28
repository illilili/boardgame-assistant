package com.boardgame.backend_spring.copyright.service;

import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckResponse;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckResponse;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CopyrightServiceImpl implements CopyrightService {
    @Override
    public ContentCopyrightCheckResponse checkContentCopyright(ContentCopyrightCheckRequest request) {
        // 더미 응답 (실제 저작권 검사 로직 필요)
        return new ContentCopyrightCheckResponse(5.7f, true, Collections.emptyList());
    }

    @Override
    public PlanCopyrightCheckResponse checkPlanCopyright(PlanCopyrightCheckRequest request) {
        // 더미 응답 (실제 기획안 저작권 검사 로직 필요)
        return new PlanCopyrightCheckResponse();
    }
}
