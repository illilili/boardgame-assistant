package com.boardgame.backend_spring.user.service;

import com.boardgame.backend_spring.project.dto.ProjectSummaryDto;
import com.boardgame.backend_spring.project.entity.Project;
import com.boardgame.backend_spring.project.repository.ProjectMemberRepository;
import com.boardgame.backend_spring.user.dto.MyPageInfoResponseDto;
import com.boardgame.backend_spring.user.dto.DeveloperSummaryDto;
import com.boardgame.backend_spring.user.dto.UserCreateRequestDto;
import com.boardgame.backend_spring.user.dto.UserResponseDto;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Transactional import 추가

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    // ProjectMemberRepository를 주입받습니다.
    private final ProjectMemberRepository projectMemberRepository;

    public UserResponseDto createUser(UserCreateRequestDto dto) {
        User user = User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword()) // 비밀번호 암호화는 AuthService에서 처리
                .name(dto.getName())
                .company(dto.getCompany())
                .role(dto.getRole())
                .build();

        return UserResponseDto.fromEntity(userRepository.save(user));
    }

    public Optional<UserResponseDto> getUserById(Long id) {
        return userRepository.findById(id).map(UserResponseDto::fromEntity);
    }

    // 마이페이지 조회 기능 수정
    @Transactional(readOnly = true) // 데이터를 조회만 하므로 readOnly 옵션 추가
    public MyPageInfoResponseDto getMyPageInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다. ID: " + userId));

        // --- 이 부분이 핵심 수정 사항입니다 ---
        // 기존: user.getProjects() -> User 엔티티의 projects 리스트를 직접 참조
        // 수정 후: projectMemberRepository를 통해 사용자가 멤버로 있는 모든 프로젝트를 조회
        List<ProjectSummaryDto> projects = projectMemberRepository.findAllByUser(user).stream()
                .map(projectMember -> ProjectSummaryDto.from(projectMember.getProject()))
                .collect(Collectors.toList());
        // ------------------------------------

        return MyPageInfoResponseDto.builder()
                .userId(user.getUserId())
                .userName(user.getName())
                .email(user.getEmail())
                .company(user.getCompany())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .participatingProjects(projects)
                .build();
    }

    // 개발자 목록 조회
    public List<DeveloperSummaryDto> getAllDevelopers() {
        return userRepository.findAllByRole(User.Role.DEVELOPER).stream()
                .map(DeveloperSummaryDto::from)
                .collect(Collectors.toList());
    }
}
