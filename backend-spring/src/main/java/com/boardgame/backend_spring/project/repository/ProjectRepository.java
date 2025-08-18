// `ProjectRepository.java`
package com.boardgame.backend_spring.project.repository;

import com.boardgame.backend_spring.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * contentId로 소속 프로젝트 찾기
     * 경로: Content(ct) -> Component(c) -> BoardgameConcept(bc) -> Project(p)
     */
    @Query("""
        select bc.project
          from Content ct
          join ct.component c
          join c.boardgameConcept bc
         where ct.contentId = :contentId
        """)
    Optional<Project> findProjectByContentId(Long contentId);

    @Query("""
    select p
      from Project p
     where p.approvedPlan.id = :planId
""")
    Optional<Project> findByApprovedPlanId(Long planId);
}