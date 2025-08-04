package com.boardgame.backend_spring.user.service;

import java.util.List;
import java.util.stream.Collectors;

import com.boardgame.backend_spring.project.dto.ProjectSummaryDto;
import com.boardgame.backend_spring.user.dto.MyPageInfoResponseDto;
import com.boardgame.backend_spring.user.dto.UserCreateRequestDto;
import com.boardgame.backend_spring.user.dto.UserResponseDto;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDto createUser(UserCreateRequestDto dto) {
        User user = User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword())
                .name(dto.getName())
                .company(dto.getCompany())
                .role(dto.getRole())
                .build();

        return UserResponseDto.fromEntity(userRepository.save(user));
    }

    public Optional<UserResponseDto> getUserById(Long id) {
        return userRepository.findById(id).map(UserResponseDto::fromEntity);
    }

    // 마이페이지 조회 기능 추가
    public MyPageInfoResponseDto getMyPageInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        List<ProjectSummaryDto> projects = user.getProjects().stream()
                .map(ProjectSummaryDto::from)
                .collect(Collectors.toList());

        return MyPageInfoResponseDto.builder()
                .userId(user.getUserId())
                .userName(user.getName())
                .email(user.getEmail())
                .company(user.getCompany())
                .role(user.getRole() != null ? user.getRole().name() : "UNKNOWN")
                .participatingProjects(projects)
                .build();
    }
}
