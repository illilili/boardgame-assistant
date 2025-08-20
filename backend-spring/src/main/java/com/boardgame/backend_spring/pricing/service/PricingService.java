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
import org.springframework.transaction.annotation.Propagation;

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

        // 6. 가격 저장은 별도 메서드로 분리 (트랜잭션 분리)
        try {
            savePriceInfo(plan.getPlanId(), result);
        } catch (Exception e) {
            // 가격 저장 실패 시 로그만 남기고 계속 진행
            System.err.println("가격 정보 저장 실패: " + e.getMessage());
            System.err.println("가격 추정 결과는 정상 반환됩니다.");
        }

        return result;
    }

    /**
     * 가격 정보를 별도 트랜잭션으로 저장
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void savePriceInfo(Long planId, PricingEstimateResponse result) {
        try {
            // 새로운 트랜잭션에서 가격 정보 저장
            Price price = priceRepository.findById(planId).orElseGet(() -> {
                Price p = new Price();
                Plan plan = planRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Plan을 찾을 수 없습니다: " + planId));
                p.setPlan(plan);
                return p;
            });

            price.setPredictedPrice(result.getPredictedPriceAsDouble());
            price.setKorPrice(result.getKorPriceAsInt());
            price.setUpdatedAt(LocalDateTime.now());

            priceRepository.save(price);
            
        } catch (Exception e) {
            // 저장 실패 시 상세 로그
            System.err.println("가격 정보 저장 중 오류 발생: " + e.getMessage());
            System.err.println("Plan ID: " + planId);
            System.err.println("예측 가격: " + result.getPredictedPrice());
            System.err.println("한국 가격: " + result.getKorPrice());
            throw e; // 상위로 예외 전파
        }
    }
}
