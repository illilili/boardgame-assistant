package com.boardgame.backend_spring.component.service;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.entity.SubTask;
import com.boardgame.backend_spring.component.enumtype.ComponentStatus;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 서브태스크 문자열 상태에 따라 컴포넌트 상태를 일관되게 갱신하는 서비스
 * - SubTask는 문자열("NOT_STARTED","IN_PROGRESS","COMPLETED")
 * - Component만 Enum(ComponentStatus) 사용
 */
@Service
@RequiredArgsConstructor
public class ComponentStatusService {

    private final ComponentRepository componentRepository;

    /**
     * 서브태스크 상태를 보고 Component.status를 계산하여 저장
     * - 이미 제출 플로우(PENDING_REVIEW/APPROVED/REJECTED)면 변경하지 않음
     */
    @Transactional
    public void recalcAndSave(Component component) {
        ComponentStatus current = component.getStatus();
        if (current == ComponentStatus.PENDING_REVIEW
                || current == ComponentStatus.APPROVED
                || current == ComponentStatus.REJECTED) {
            return; // 제출 이후 상태는 외부 승인/반려 로직이 담당
        }

        List<SubTask> subs = component.getSubTasks();
        if (subs == null || subs.isEmpty()) {
            component.setStatus(ComponentStatus.WAITING);
            componentRepository.save(component);
            return;
        }

        boolean allNotStarted = subs.stream().allMatch(s -> "NOT_STARTED".equals(s.getStatus()));
        boolean allCompleted  = subs.stream().allMatch(s -> "COMPLETED".equals(s.getStatus()));
        boolean anyInProgress = subs.stream().anyMatch(s -> "IN_PROGRESS".equals(s.getStatus()));

        if (allNotStarted) {
            component.setStatus(ComponentStatus.WAITING);
        } else if (allCompleted) {
            component.setStatus(ComponentStatus.READY_TO_SUBMIT);
        } else if (anyInProgress) {
            component.setStatus(ComponentStatus.IN_PROGRESS);
        } else {
            // 혼재(미시작+완료 섞임 등)인 경우도 진행 중으로 본다
            component.setStatus(ComponentStatus.IN_PROGRESS);
        }

        componentRepository.save(component);
    }
}
