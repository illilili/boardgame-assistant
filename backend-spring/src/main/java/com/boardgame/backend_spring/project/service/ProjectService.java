// ProjectService.java
package com.boardgame.backend_spring.project.service;

import com.boardgame.backend_spring.plan.entity.PlanStatus;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.project.dto.*;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.entity.ProjectMember;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.project.repository.ProjectMemberRepository;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final PlanRepository planRepository;

    // 🚨 [신규] 로그인 사용자가 참여한 프로젝트 목록 조회
    @Transactional(readOnly = true)
    public List<ProjectSummaryDto> getProjectsByCreator(User user) {
        // 💡 로그인한 유저가 PUBLISHER 역할인지 확인합니다.
        if (user.getRole() == User.Role.PUBLISHER) {
            // PUBLISHER라면 모든 프로젝트 목록을 반환합니다.
            return projectRepository.findAll().stream()
                    .map(ProjectSummaryDto::from)
                    .collect(Collectors.toList());
        } else {
            // 다른 역할(기획자 등)은 기존처럼 자신이 참여한 프로젝트만 봅니다.
            List<ProjectMember> members = projectMemberRepository.findAllByUser(user);
            return members.stream()
                    .map(ProjectMember::getProject)
                    .map(ProjectSummaryDto::from)
                    .collect(Collectors.toList());
        }
    }

    // 프로젝트 생성 - 로그인 사용자 기준 (PLANNER만)
    @Transactional
    public ProjectCreateResponseDto createProject(ProjectCreateRequestDto dto, User user) {
        if (user.getRole() != User.Role.PLANNER) {
            throw new RuntimeException("기획자만 프로젝트를 생성할 수 있습니다.");
        }

        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build(); // status는 @PrePersist에서 자동으로 PLANNING 지정

        Project saved = projectRepository.save(project);

        projectMemberRepository.save(ProjectMember.builder()
                .project(saved)
                .user(user)
                .role(ProjectMember.Role.PLANNER)
                .build());

        return new ProjectCreateResponseDto(
                saved.getId(),
                saved.getName(),
                user.getName(),
                "프로젝트가 성공적으로 생성되었습니다."
        );
    }

    // 프로젝트 상태 조회
    public ProjectStatusResponseDto getProjectStatus(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return new ProjectStatusResponseDto(project.getStatus());
    }

    // 프로젝트 이름 변경 (PUBLISHER or ADMIN or 참여자)
    public ProjectRenameResponseDto renameProject(Long projectId, String newTitle, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (user.getRole() != User.Role.PUBLISHER &&
                user.getRole() != User.Role.ADMIN &&
                !projectMemberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("프로젝트 멤버 또는 관리자, 퍼블리셔만 수정할 수 있습니다.");
        }

        project.setName(newTitle);
        projectRepository.save(project);

        return new ProjectRenameResponseDto(projectId, newTitle, "프로젝트 이름이 성공적으로 수정되었습니다.");
    }

    // 개발자 배정 (PUBLISHER만 가능)
    @Transactional
    public void assignDeveloperToProject(Long projectId, AssignDeveloperRequestDto dto, User currentUser) {
        if (currentUser.getRole() != User.Role.PUBLISHER) {
            throw new RuntimeException("퍼블리셔만 개발자를 배정할 수 있습니다.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        // 🚨 수정된 로직: Project 엔티티의 approvedPlan 필드를 직접 확인
        if (project.getApprovedPlan() == null) {
            throw new RuntimeException("기획안이 승인되지 않은 상태에서는 개발자를 배정할 수 없습니다.");
        }

        User developer = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        boolean exists = projectMemberRepository.existsByProjectAndUser(project, developer);
        if (exists) {
            throw new RuntimeException("해당 사용자는 이미 이 프로젝트에 참여 중입니다.");
        }

        ProjectMember newMember = ProjectMember.builder()
                .project(project)
                .user(developer)
                .role(ProjectMember.Role.DEVELOPER)
                .build();
        projectMemberRepository.save(newMember);
    }
}