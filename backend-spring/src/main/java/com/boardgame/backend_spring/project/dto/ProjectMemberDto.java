// ProjectMemberDto.java
package com.boardgame.backend_spring.project.dto;

import com.boardgame.backend_spring.project.entity.ProjectMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProjectMemberDto {
    private Long userId;
    private String userName;
    private ProjectMember.Role role;
}
