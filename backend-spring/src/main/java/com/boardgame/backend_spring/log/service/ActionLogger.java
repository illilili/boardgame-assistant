package com.boardgame.backend_spring.log.service;

import com.boardgame.backend_spring.component.repository.ComponentRepository;
import com.boardgame.backend_spring.log.entity.ActivityLog;
import com.boardgame.backend_spring.log.repository.ActivityLogRepository;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ActionLogger {

    private final ActivityLogRepository repo;
    private final PlanRepository planRepository;
    private final ComponentRepository componentRepository;

    public void log(String action, String targetType, Long targetId) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User)) {
            return;
        }
        User me = (User) principal;

        ActivityLog log = new ActivityLog();
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setUsername(me.getName()); // 풀 네임
        log.setTimestamp(LocalDateTime.now());

        // projectId 채우기
        if ("PROJECT".equalsIgnoreCase(targetType)) {
            log.setProjectId(targetId);
        } else if ("PLAN".equalsIgnoreCase(targetType)) {
            planRepository.findById(targetId)
                    .ifPresent(plan -> log.setProjectId(plan.getProject().getId()));
        } else if ("CONTENT".equalsIgnoreCase(targetType)) {
            componentRepository.findById(targetId)
                    .ifPresent(c -> {
                        if (c.getBoardgameConcept() != null && c.getBoardgameConcept().getProject() != null) {
                            log.setProjectId(c.getBoardgameConcept().getProject().getId());
                        }
                    });
        }

        repo.save(log);
    }
}
