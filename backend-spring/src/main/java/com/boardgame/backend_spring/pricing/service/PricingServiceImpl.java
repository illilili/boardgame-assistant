package com.boardgame.backend_spring.pricing.service;

import com.boardgame.backend_spring.pricing.dto.PricingEstimateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateResponse;
import org.springframework.stereotype.Service;

@Service
public class PricingServiceImpl implements PricingService {
    @Override
    public PricingEstimateResponse estimate(PricingEstimateRequest request) {
        // 더미 로직: 실제 가격 산출 로직은 추후 구현
        return new PricingEstimateResponse(5800, 12000, 0.52);
    }
}
