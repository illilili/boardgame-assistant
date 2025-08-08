package com.boardgame.backend_spring.pricing.service;

import com.boardgame.backend_spring.pricing.dto.PricingEstimateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateResponse;

public interface PricingService {
    PricingEstimateResponse estimate(PricingEstimateRequest request);
}
