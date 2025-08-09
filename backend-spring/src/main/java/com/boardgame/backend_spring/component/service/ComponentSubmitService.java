package com.boardgame.backend_spring.component.service;

import com.boardgame.backend_spring.component.entity.Component;
import com.boardgame.backend_spring.component.enumtype.ComponentStatus;
import com.boardgame.backend_spring.component.repository.ComponentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 컴포넌트 제출: 모든 SubTask가 COMPLETED → READY_TO_SUBMIT 상태여야 가능
 */
@Service
@RequiredArgsConstructor
public class ComponentSubmitService {

    private final ComponentRepository componentRepository;

    @Transactional
    public void submit(Long componentId) {
        Component comp = componentRepository.findById(componentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 컴포넌트입니다."));

        if (comp.getStatus() != ComponentStatus.READY_TO_SUBMIT) {
            throw new IllegalStateException("모든 콘텐츠가 완료되어 제출 가능한 상태(READY_TO_SUBMIT)여야 합니다.");
        }
        comp.setStatus(ComponentStatus.PENDING_REVIEW);
        componentRepository.save(comp);
    }
}
