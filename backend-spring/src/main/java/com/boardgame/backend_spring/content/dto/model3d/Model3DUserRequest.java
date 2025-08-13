// 사용자가 입력하는 최소 필드만 포함
package com.boardgame.backend_spring.content.dto.model3d;

import lombok.Data;

/**
 * [DTO] 3D 모델 생성을 위한 사용자 입력 데이터
 * - contentId 기반으로 theme, storyline, componentInfo는 백엔드에서 채움
 */
@Data
public class Model3DUserRequest {
    private Long contentId;     // 콘텐츠 ID
    private String name;        // 구성요소 이름
    private String description; // 구성요소 설명 (roleAndEffect)
    private String componentInfo; // 구성요소 아트컨셉(artConcept)
    private String style;       // 스타일 선택
}