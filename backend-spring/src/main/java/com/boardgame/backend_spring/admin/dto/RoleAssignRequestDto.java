package com.boardgame.backend_spring.admin.dto;

/**
 * 역할 부여 요청을 받을 때 사용하는 DTO
 * userId와 부여할 role 값을 포함함
 */
public class RoleAssignRequestDto {
    private Long userId;
    private String newRole;

    public Long getUserId() {
        return userId;
    }

    public String getNewRole() {
        return newRole;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setNewRole(String newRole) {
        this.newRole = newRole;
    }
}
