package com.boardgame.backend_spring.admin.dto;

/**
 * 역할 부여 응답을 반환할 때 사용하는 DTO
 * 성공 메시지와 부여된 role 값을 포함
 */
public class RoleAssignResponseDto {
    private String message;
    private String updatedRole;

    public RoleAssignResponseDto(String message, String updatedRole) {
        this.message = message;
        this.updatedRole = updatedRole;
    }

    public String getMessage() {
        return message;
    }

    public String getUpdatedRole() {
        return updatedRole;
    }
}
