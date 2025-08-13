package com.boardgame.backend_spring.admin.service;

import com.boardgame.backend_spring.admin.dto.RoleAssignRequestDto;
import com.boardgame.backend_spring.admin.dto.RoleAssignResponseDto;
import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

/**
 * 관리자 역할 부여 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class RoleAssignService {

    private final UserRepository userRepository;

    public RoleAssignService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 특정 사용자에게 새로운 역할을 부여하는 메서드
     * @param request 역할 부여 요청 정보
     * @return 역할 변경 결과 메시지 및 변경된 역할 정보
     */
    @Transactional
    public RoleAssignResponseDto assignRole(RoleAssignRequestDto request) {
        // userId로 사용자 조회 (없을 경우 예외 발생)
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));

        // 역할 업데이트
        user.setRole(User.Role.valueOf(request.getNewRole().toUpperCase()));
        userRepository.save(user);

        // 응답 반환
        return new RoleAssignResponseDto("역할이 성공적으로 변경되었습니다.", user.getRole().name());

    }
}
