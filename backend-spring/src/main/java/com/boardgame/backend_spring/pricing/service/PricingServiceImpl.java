package com.boardgame.backend_spring.pricing.service;

import com.boardgame.backend_spring.pricing.dto.PricingEstimateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PricingServiceImpl implements PricingService {

    private final RestTemplate restTemplate;

    @Value("${ai.pricing.url}")  // application.properties 에 등록된 주소
    private String aiPricingUrl;

    public PricingServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public PricingEstimateResponse estimate(PricingEstimateRequest request) {
        // FastAPI에 보낼 요청 객체
        Map<String, Object> fastApiRequest = new HashMap<>();
        fastApiRequest.put("planId", request.getProjectId());

        try {
            // FastAPI 응답 형식: { "planId": 1, "predicted_price": 14300.27 }
            Map response = restTemplate.postForObject(
                    aiPricingUrl + "/api/ai-pricing/estimate",
                    fastApiRequest,
                    Map.class
            );

            if (response == null || response.get("predicted_price") == null) {
                throw new RuntimeException("예측 실패: FastAPI 응답 없음");
            }

            double predictedPrice = Double.parseDouble(response.get("predicted_price").toString());
            int estimatedCost = (int) (predictedPrice * 0.45); // 예시: 원가는 45%
            int suggestedPrice = (int) predictedPrice;
            double marginRate = (suggestedPrice - estimatedCost) / (double) suggestedPrice;

            return new PricingEstimateResponse(estimatedCost, suggestedPrice, marginRate);

        } catch (Exception e) {
            throw new RuntimeException("FastAPI 가격 예측 호출 실패: " + e.getMessage());
        }
    }
}
