package com.boardgame.backend_spring.pricing.dto;

import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 가격 책정 응답 DTO
 */
@Getter
@Setter
public class PricingEstimateResponse {

    private Long planId;

    @JsonProperty("predicted_price")
    private String predictedPrice; // 예: "$39.99"

    @JsonProperty("kor_price")
    private String korPrice;       // 예: "53,990원"

    public double getPredictedPriceAsDouble() {
        return Double.parseDouble(predictedPrice.replace("$", ""));
    }

    public int getKorPriceAsInt() {
        return Integer.parseInt(korPrice.replace("원", "").replace(",", ""));
    }
}

