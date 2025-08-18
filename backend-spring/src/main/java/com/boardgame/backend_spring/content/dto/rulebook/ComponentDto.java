package com.boardgame.backend_spring.content.dto.rulebook;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ComponentDto {
    private String type;
    private String title;
    private String quantity;
}
