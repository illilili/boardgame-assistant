package com.boardgame.backend_spring.copyright.controller;

import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckRequest;
import com.boardgame.backend_spring.copyright.dto.ContentCopyrightCheckResponse;
import com.boardgame.backend_spring.copyright.service.CopyrightService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
public class CopyrightController {
    private final CopyrightService copyrightService;

    public CopyrightController(CopyrightService copyrightService) {
        this.copyrightService = copyrightService;
    }

    @PostMapping("/copyright-content")
    public ContentCopyrightCheckResponse checkContentCopyright(@RequestBody ContentCopyrightCheckRequest request) {
        return copyrightService.checkContentCopyright(request);
    }
}
