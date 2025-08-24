package com.boardgame.backend_spring.content.dto.model3d;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 3D 모델 비동기 작업 요청에 대한 응답 DTO
 * - FastAPI에서 taskId만 반환할 때 사용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Generate3DTaskResponse {
    private String taskId;   // 작업 식별자
    private String status;   // IN_PROGRESS, DONE, FAILED
}
