package com.boardgame.backend_spring.user.dto;

import com.boardgame.backend_spring.project.dto.ProjectSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 마이페이지에서 보여줄 사용자 참여 프로젝트 정보
 */
@Getter
@Builder
@AllArgsConstructor
public class MyPageInfoResponseDto {
    private Long userId;
    private String userName;
    private String email;
    private String company;
    private String role;
    private List<ProjectSummaryDto> participatingProjects;
}
