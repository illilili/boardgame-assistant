package com.boardgame.backend_spring.translate.repository;

import com.boardgame.backend_spring.translate.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * 번역 엔티티 JPA 리포지토리
 */
public interface TranslationRepository extends JpaRepository<Translation, Long> {

    /** contentId 기준 최신순 전체 조회 */
    List<Translation> findByContent_ContentIdOrderByCreatedAtDesc(Long contentId);

    /** 동일 content + language 조합의 가장 큰 iteration 값 조회 (없으면 0) */
    @Query("""
           select coalesce(max(t.iteration), 0)
           from Translation t
           where t.content.contentId = :contentId and t.targetLanguage = :lang
           """)
    int findMaxIteration(Long contentId, String lang);
}
