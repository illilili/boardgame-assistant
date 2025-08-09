package com.boardgame.backend_spring.content.repository;

import com.boardgame.backend_spring.content.entity.Content;
import com.boardgame.backend_spring.content.entity.ContentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContentVersionRepository extends JpaRepository<ContentVersion, Long> {

    /** 해당 콘텐츠의 최대 버전 번호(없으면 0) */
    @Query("select coalesce(max(v.versionNo), 0) from ContentVersion v where v.content.id = :contentId")
    int findMaxVersionNo(@Param("contentId") Long contentId);

    /** 최신순 버전 목록 */
    List<ContentVersion> findByContentOrderByVersionNoDesc(Content content);
}
