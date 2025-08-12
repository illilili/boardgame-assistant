package com.boardgame.backend_spring.log.repository;

import com.boardgame.backend_spring.log.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Optional<ActivityLog> findTopByActionAndTargetTypeAndTargetIdOrderByTimestampDesc(
            String action, String targetType, Long targetId
    );

}