package com.boardgame.backend_spring.project.service;

import com.boardgame.backend_spring.project.dto.ProjectCreateRequestDto;
import com.boardgame.backend_spring.project.dto.ProjectCreateResponseDto;
import com.boardgame.backend_spring.project.dto.ProjectStatusResponseDto;
import com.boardgame.backend_spring.project.dto.ProjectRenameResponseDto;
import com.boardgame.backend_spring.project.dto.AssignDeveloperRequestDto;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.entity.ProjectMember;
import com.boardgame.backend_spring.project.repository.ProjectRepository;
import com.boardgame.backend_spring.project.repository.ProjectMemberRepository;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public ProjectCreateResponseDto createProject(ProjectCreateRequestDto dto, User user) {
        // 역할 검사: PLANNER만 허용
        if (user.getRole() != User.Role.PLANNER) {
            throw new RuntimeException("기획자만 프로젝트를 생성할 수 있습니다.");
        }

        // 프로젝트 엔티티 생성
        Project project = Project.builder()
                .name(dto.getTitle())
                .status("DRAFT")
                .createdAt(LocalDateTime.now())
                .build();

        Project saved = projectRepository.save(project);

        // 생성자를 PLANNER로 프로젝트 멤버에 등록
        projectMemberRepository.save(ProjectMember.builder()
                .project(saved)
                .user(user)
                .role(ProjectMember.Role.PLANNER)
                .build());

        // 응답 DTO 반환
        return new ProjectCreateResponseDto(
                saved.getId(),
                saved.getName(),
                user.getName(),
                "프로젝트가 성공적으로 생성되었습니다."
        );
    }

    public ProjectStatusResponseDto getProjectStatus(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return new ProjectStatusResponseDto(project.getStatus());
    }

    public ProjectRenameResponseDto renameProject(Long projectId, String newTitle, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 권한 확인: PUBLISHER 또는 ADMIN
        if (user.getRole() != User.Role.PUBLISHER &&
                user.getRole() != User.Role.ADMIN &&
                !projectMemberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("프로젝트 멤버 또는 관리자, 퍼블리셔만 수정할 수 있습니다.");
        }

        project.setName(newTitle);
        projectRepository.save(project);

        return new ProjectRenameResponseDto(projectId, newTitle, "프로젝트 이름이 성공적으로 수정되었습니다.");
    }

    public void assignDeveloperToProject(Long projectId, AssignDeveloperRequestDto dto, User currentUser) {
        if (currentUser.getRole() != User.Role.PUBLISHER) {
            throw new RuntimeException("퍼블리셔만 개발자를 배정할 수 있습니다.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        User developer = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 이미 멤버인지 확인
        boolean exists = projectMemberRepository.existsByProjectAndUser(project, developer);
        if (exists) {
            throw new RuntimeException("해당 사용자는 이미 이 프로젝트에 참여 중입니다.");
        }

        // 개발자로 배정
        ProjectMember newMember = ProjectMember.builder()
                .project(project)
                .user(developer)
                .role(ProjectMember.Role.DEVELOPER)
                .build();
        projectMemberRepository.save(newMember);
    }
}
