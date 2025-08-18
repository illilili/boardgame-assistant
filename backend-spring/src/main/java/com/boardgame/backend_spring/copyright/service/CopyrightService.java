package com.boardgame.backend_spring.copyright.service;

import com.boardgame.backend_spring.copyright.dto.CopyrightCheckRequestDto;
import com.boardgame.backend_spring.copyright.dto.CopyrightCheckResponseDto;
import com.boardgame.backend_spring.copyright.dto.SimilarGameDto;
import com.boardgame.backend_spring.copyright.entity.Copyright;
import com.boardgame.backend_spring.copyright.repository.CopyrightRepository;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CopyrightService {

    private final WebClient.Builder webClientBuilder;
    private final PlanRepository planRepository;
    private final CopyrightRepository copyrightRepository;
    private final ObjectMapper objectMapper;

    @Value("${fastapi.service.url}")
    private String fastApiBaseUrl;

    /**
     * 저작권 검사 실행 + DB 저장
     */
    public CopyrightCheckResponseDto checkCopyright(CopyrightCheckRequestDto request) {
        // 1) FastAPI 호출
        CopyrightCheckResponseDto response = webClientBuilder.build()
                .post()
                .uri(fastApiBaseUrl + "/api/plans/copyright-plan")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(CopyrightCheckResponseDto.class)
                .block();

        if (response == null) {
            throw new RuntimeException("저작권 검사 서비스 응답이 없습니다.");
        }

        // 2) Plan 조회
        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with id: " + request.getPlanId()));

        try {
            // 3) SimilarGames → JSON 문자열 변환
            String similarGamesJson = objectMapper.writeValueAsString(response.getSimilarGames());

            // 4) 기존 결과 있으면 업데이트, 없으면 새로 생성
            Copyright entity = copyrightRepository.findByPlan(plan)
                    .orElse(new Copyright());

            entity.setPlan(plan);
            entity.setRiskLevel(response.getRiskLevel().toString());
            entity.setSimilarGamesJson(similarGamesJson);
            entity.setAnalysisSummary(buildAnalysisSummary(response));
            entity.setCheckedAt(LocalDateTime.now());

            copyrightRepository.save(entity);
        } catch (Exception e) {
            throw new RuntimeException("저작권 검사 결과 저장 중 오류 발생: " + e.getMessage());
        }

        return response;
    }

    /**
     * 저장된 저작권 검사 결과 조회
     */
    public CopyrightCheckResponseDto getCopyrightResult(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with id: " + planId));

        Copyright entity = copyrightRepository.findByPlan(plan)
                .orElseThrow(() -> new EntityNotFoundException("저작권 검사 결과가 없습니다."));

        try {
            List<SimilarGameDto> similarGames = objectMapper.readValue(
                    entity.getSimilarGamesJson(),
                    new TypeReference<List<SimilarGameDto>>() {}
            );

            // FastAPI 응답 구조 그대로 매핑
            CopyrightCheckResponseDto dto = new CopyrightCheckResponseDto();
            dto.setPlanId(planId);
            dto.setRiskLevel(entity.getRiskLevel());
            dto.setSimilarGames(similarGames);
            dto.setAnalysisSummary(entity.getAnalysisSummary());
            return dto;

        } catch (Exception e) {
            throw new RuntimeException("저작권 검사 결과 변환 실패: " + e.getMessage());
        }
    }

    /**
     * 분석 결과 간단 요약
     */
    private String buildAnalysisSummary(CopyrightCheckResponseDto response) {
        StringBuilder sb = new StringBuilder();
        sb.append("위험도: ").append(response.getRiskLevel()).append("\n");
        sb.append("유사 게임 수: ").append(response.getSimilarGames().size()).append("\n");
        if (!response.getSimilarGames().isEmpty()) {
            sb.append("대표 유사 게임: ").append(response.getSimilarGames().get(0).getTitle());
        }
        return sb.toString();
    }
}
