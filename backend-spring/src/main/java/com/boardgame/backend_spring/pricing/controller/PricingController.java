package com.boardgame.backend_spring.pricing.controller;

import com.boardgame.backend_spring.pricing.dto.PricingEstimateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateResponse;
import com.boardgame.backend_spring.pricing.service.PricingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {
    private final PricingService pricingService;

    public PricingController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    @PostMapping("/estimate")
    public PricingEstimateResponse estimate(@RequestBody PricingEstimateRequest request) {
        return pricingService.estimate(request);
    }
}
