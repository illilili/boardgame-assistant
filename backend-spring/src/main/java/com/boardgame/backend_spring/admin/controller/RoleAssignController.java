package com.boardgame.backend_spring.admin.controller;

import com.boardgame.backend_spring.admin.dto.RoleAssignRequestDto;
import com.boardgame.backend_spring.admin.dto.RoleAssignResponseDto;
import com.boardgame.backend_spring.admin.service.RoleAssignService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자용 역할 부여 API 컨트롤러
 */
@RestController
@RequestMapping("/api/admin")
public class RoleAssignController {

    private final RoleAssignService roleAssignService;

    public RoleAssignController(RoleAssignService roleAssignService) {
        this.roleAssignService = roleAssignService;
    }

    /**
     * POST /api/admin/assign-role
     * 관리자가 특정 유저에게 새로운 역할을 부여하는 API
     * @param requestDto 역할 부여 요청 정보 (userId, newRole)
     * @return 역할 변경 결과 응답
     */
    @PostMapping("/assign-role")
    public ResponseEntity<RoleAssignResponseDto> assignRole(@RequestBody RoleAssignRequestDto requestDto) {
        RoleAssignResponseDto response = roleAssignService.assignRole(requestDto);
        return ResponseEntity.ok(response);
    }
}
