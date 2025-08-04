package com.boardgame.backend_spring.plan.service;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.concept.entity.BoardgameConcept;
import com.boardgame.backend_spring.concept.repository.BoardgameConceptRepository;
import com.boardgame.backend_spring.goal.entity.GameObjective;
import com.boardgame.backend_spring.goal.repository.GameObjectiveRepository;
import com.boardgame.backend_spring.plan.dto.PlanVersionDto;
import com.boardgame.backend_spring.plan.dto.SummaryDto;
import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.entity.PlanVersion;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.plan.repository.PlanVersionRepository;
import com.boardgame.backend_spring.rule.entity.GameRule;
import com.boardgame.backend_spring.rule.repository.GameRuleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final BoardgameConceptRepository conceptRepository;
    private final GameObjectiveRepository objectiveRepository;
    private final GameRuleRepository ruleRepository;
    private final ComponentRepository componentRepository;
    private final PlanRepository planRepository;
    private final PlanVersionRepository planVersionRepository;
    private final RestTemplate restTemplate;

    @Value("${fastapi.service.url}/api/plans/generate-summary")
    private String summaryApiUrl;

    @Transactional(readOnly = true)
    public List<SummaryDto.ConceptListInfo> getConceptList() {
        return conceptRepository.findAll().stream()
                .map(concept -> SummaryDto.ConceptListInfo.builder()
                        .conceptId(concept.getConceptId())
                        .theme(concept.getTheme())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public SummaryDto.GenerateResponse generateSummaryDocument(Long conceptId) {
        BoardgameConcept concept = conceptRepository.findById(conceptId)
                .orElseThrow(() -> new EntityNotFoundException("Concept not found with id: " + conceptId));

        // FastAPI 요청 데이터 준비
        SummaryDto.FastApiRequest fastApiRequest = buildFastApiRequest(concept);

        // FastAPI 호출하여 기획서 텍스트 생성
        String generatedText;
        try {
            generatedText = restTemplate.postForObject(summaryApiUrl, fastApiRequest, String.class);
            if (generatedText == null) {
                throw new RuntimeException("AI 서비스로부터 응답을 받지 못했습니다.");
            }
        } catch (Exception e) {
            throw new RuntimeException("AI 기획서 생성 서비스 호출에 실패했습니다: " + e.getMessage());
        }

        // 해당 컨셉에 대한 Plan이 이미 있는지 확인하고, 없으면 새로 생성
        Plan plan = planRepository.findByBoardgameConcept(concept)
                .orElseGet(() -> Plan.create(concept, generatedText));

        // 생성된 내용으로 Plan의 현재 내용을 업데이트
        plan.setCurrentContent(generatedText);
        planRepository.save(plan);

        // 프론트엔드에 planId와 생성된 텍스트를 반환
        return SummaryDto.GenerateResponse.builder()
                .planId(plan.getPlanId())
                .summaryText(generatedText)
                .build();
    }

    // --- 버전 관리 서비스 메소드 ---

    @Transactional
    public PlanVersionDto.SaveResponse saveVersion(PlanVersionDto.SaveRequest request) {
        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with id: " + request.getPlanId()));

        // [중요] 사용자가 수정한 최신 내용을 Plan 엔티티에 먼저 반영
        plan.setCurrentContent(request.getPlanContent());
        planRepository.save(plan);

        // 업데이트된 Plan을 기반으로 새로운 버전 생성
        PlanVersion version = PlanVersion.create(plan, request.getVersionName(), request.getMemo());
        planVersionRepository.save(version);

        return PlanVersionDto.SaveResponse.builder()
                .versionId(version.getVersionId())
                .versionName(version.getVersionName())
                .savedAt(version.getCreatedAt())
                .message("기획안 버전이 성공적으로 저장되었습니다.")
                .build();
    }

    @Transactional(readOnly = true)
    public PlanVersionDto.VersionListResponse getVersions(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with id: " + planId));

        List<PlanVersionDto.VersionInfo> versions = planVersionRepository.findByPlanOrderByCreatedAtDesc(plan).stream()
                .map(v -> PlanVersionDto.VersionInfo.builder()
                        .versionId(v.getVersionId())
                        .versionName(v.getVersionName())
                        .memo(v.getMemo())
                        .createdAt(v.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return PlanVersionDto.VersionListResponse.builder()
                .planId(plan.getPlanId())
                .versions(versions)
                .build();
    }

    @Transactional
    public PlanVersionDto.RollbackResponse rollbackVersion(Long planId, Long versionId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with id: " + planId));
        PlanVersion versionToRollback = planVersionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found with id: " + versionId));

        // Plan의 현재 내용을 롤백하려는 버전의 내용으로 덮어쓰기
        plan.setCurrentContent(versionToRollback.getPlanContent());
        planRepository.save(plan);

        return PlanVersionDto.RollbackResponse.builder()
                .planId(plan.getPlanId())
                .versionId(versionToRollback.getVersionId())
                .rolledBackContent(plan.getCurrentContent()) // 롤백된 최신 내용을 응답에 포함
                .rolledBackAt(LocalDateTime.now())
                .message("'" + versionToRollback.getVersionName() + "' 버전으로 기획안이 성공적으로 롤백되었습니다.")
                .build();
    }

    // FastAPI 요청 객체를 생성하는 private 헬퍼 메소드
    private SummaryDto.FastApiRequest buildFastApiRequest(BoardgameConcept concept) {
        GameObjective objective = objectiveRepository.findByBoardgameConcept(concept).orElse(new GameObjective());
        GameRule rule = ruleRepository.findByBoardgameConcept(concept).orElse(new GameRule());
        List<Component> components = componentRepository.findByBoardgameConcept(concept);

        SummaryDto.ConceptInfo conceptInfo = SummaryDto.ConceptInfo.builder()
                .theme(concept.getTheme()).playerCount(concept.getPlayerCount()).averageWeight(concept.getAverageWeight())
                .ideaText(concept.getIdeaText()).mechanics(concept.getMechanics()).storyline(concept.getStoryline()).build();

        SummaryDto.GoalInfo goalInfo = SummaryDto.GoalInfo.builder()
                .mainGoal(objective.getMainGoal()).subGoals(objective.getSubGoals()).winConditionType(objective.getWinConditionType()).build();

        SummaryDto.RuleInfo ruleInfo = SummaryDto.RuleInfo.builder()
                .turnStructure(rule.getTurnStructure()).actionRules(rule.getActionRules()).victoryCondition(rule.getVictoryCondition()).build();

        List<SummaryDto.ComponentInfo> componentInfoList = components.stream()
                .map(c -> SummaryDto.ComponentInfo.builder()
                        .title(c.getTitle())
                        .role_and_effect(c.getRoleAndEffect())
                        .build())
                .collect(Collectors.toList());

        return SummaryDto.FastApiRequest.builder()
                .gameName(concept.getTheme())
                .concept(conceptInfo)
                .goal(goalInfo)
                .rule(ruleInfo)
                .components(componentInfoList)
                .build();
    }
}
