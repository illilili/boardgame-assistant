package com.boardgame.backend_spring.copyright.controller;

import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckResponse;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.PlanCopyrightCheckResponse;
import com.boardgame.backend_spring.copyright.service.CopyrightService;
import org.springframework.web.bind.annotation.*;

@RestController
public class CopyrightController {
    private final CopyrightService copyrightService;

    public CopyrightController(CopyrightService copyrightService) {
        this.copyrightService = copyrightService;
    }

    @PostMapping("/api/content/copyright-content")
    public ContentCopyrightCheckResponse checkContentCopyright(@RequestBody ContentCopyrightCheckRequest request) {
        return copyrightService.checkContentCopyright(request);
    }
    @PostMapping("/api/plans/copyright-plan")
    public PlanCopyrightCheckResponse checkPlanCopyright(@RequestBody PlanCopyrightCheckRequest request) {
        return copyrightService.checkPlanCopyright(request);
    }
}
