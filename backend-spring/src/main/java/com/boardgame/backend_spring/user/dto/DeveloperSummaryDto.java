package com.boardgame.backend_spring.user.dto;

import com.boardgame.backend_spring.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DeveloperSummaryDto {
    private Long userId;
    private String name;
    private String email;

    public static DeveloperSummaryDto from(User user) {
        return new DeveloperSummaryDto(
                user.getUserId(),
                user.getName(),
                user.getEmail()
        );
    }
}
