package com.boardgame.backend_spring.regenerate.controller;

import com.boardgame.backend_spring.regenerate.dto.RegenerateDto;
import com.boardgame.backend_spring.regenerate.service.RegenerateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans")
public class RegenerateController {

    private final RegenerateService regenerateService;

    @Autowired
    public RegenerateController(RegenerateService regenerateService) {
        this.regenerateService = regenerateService;
    }


}