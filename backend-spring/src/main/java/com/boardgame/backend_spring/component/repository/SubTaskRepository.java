// 파일: component/repository/SubTaskRepository.java
package com.boardgame.backend_spring.component.repository;

import com.boardgame.backend_spring.component.entity.SubTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {
    Optional<SubTask> findByContentId(Long contentId);
    List<SubTask> findByComponent_ComponentId(Long componentId);
}