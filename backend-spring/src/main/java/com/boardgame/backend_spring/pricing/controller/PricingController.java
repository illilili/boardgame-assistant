package com.boardgame.backend_spring.pricing.controller;

import com.boardgame.backend_spring.pricing.dto.PricingEstimateGenerateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateResponse;
import com.boardgame.backend_spring.pricing.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @PostMapping("/estimate")
    public ResponseEntity<PricingEstimateResponse> estimatePrice(
            @RequestBody PricingEstimateGenerateRequest request) {
        return ResponseEntity.ok(pricingService.estimatePrice(request));
    }
}
