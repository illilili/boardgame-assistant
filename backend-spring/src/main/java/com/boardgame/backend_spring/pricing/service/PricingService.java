package com.boardgame.backend_spring.pricing.service;

import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateGenerateRequest;
import com.boardgame.backend_spring.pricing.dto.PricingEstimateResponse;
import com.boardgame.backend_spring.pricing.entity.Price;
import com.boardgame.backend_spring.pricing.repository.PriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final PlanRepository planRepository;
    private final PriceRepository priceRepository;

    @Value("${fastapi.service.url}")
    private String fastApiBaseUrl;

    @Transactional
    public PricingEstimateResponse estimatePrice(PricingEstimateGenerateRequest request) {
        // 1. Plan 찾기
        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("해당 Plan이 존재하지 않습니다."));

        // 2. 기획서 본문 가져오기 (null 체크)
        String planText = plan.getCurrentContent();
        if (planText == null || planText.isBlank()) {
            throw new IllegalArgumentException("해당 Plan에 기획서 본문이 없습니다.");
        }

        // 3. FastAPI 요청 DTO 구성
        PricingEstimateRequest pythonRequest = new PricingEstimateRequest();
        pythonRequest.setPlanId(plan.getPlanId());
        pythonRequest.setPlanText(planText);

        // 4. URL 구성
        String url = UriComponentsBuilder.fromHttpUrl(fastApiBaseUrl)
                .path("/api/ai-pricing/estimate")
                .toUriString();

        // 5. FastAPI 호출
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        RestTemplate restTemplate = new RestTemplate();

        PricingEstimateResponse result;
        try {
            ResponseEntity<PricingEstimateResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(pythonRequest, headers),
                    PricingEstimateResponse.class
            );
            result = response.getBody();
        } catch (RestClientException e) {
            throw new RuntimeException("FastAPI 가격 책정 요청 실패: " + e.getMessage(), e);
        }

        if (result == null || result.getPredictedPrice() == null || result.getKorPrice() == null) {
            throw new RuntimeException("FastAPI 응답이 유효하지 않습니다: " + result);
        }

        // 6. 가격 저장 (새로운 Plan이면 Plan 세팅)
        Price price = priceRepository.findById(plan.getPlanId()).orElseGet(() -> {
            Price p = new Price();
            p.setPlan(plan);
            return p;
        });

        price.setPredictedPrice(result.getPredictedPriceAsDouble());
        price.setKorPrice(result.getKorPriceAsInt());
        price.setUpdatedAt(LocalDateTime.now());

        priceRepository.save(price);

        return result;
    }
}
