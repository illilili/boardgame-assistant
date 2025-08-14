package com.boardgame.backend_spring.log.repository;

import com.boardgame.backend_spring.log.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // 특정 액션 + 타겟 조회 (기존)
    Optional<ActivityLog> findTopByActionAndTargetTypeAndTargetIdOrderByTimestampDesc(
            String action,
            String targetType,
            Long targetId
    );

    // 프로젝트별 최근 5개 로그 조회
    List<ActivityLog> findTop5ByProjectIdOrderByTimestampDesc(Long projectId);
}
