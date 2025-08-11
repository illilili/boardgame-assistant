package com.boardgame.backend_spring.content.dto.rulebook;

import lombok.Data;

import java.util.List;

/**
 * [DTO] FastAPI로 전송할 룰북 생성 요청 데이터
 * - 기획안(Plan) ID 및 컨셉, 규칙, 세계관 정보를 포함함
 */
@Data
public class RulebookRequest {

    private Long planId;
    private Long contentId;// 기획안 ID
    private String title;
    private String theme;             // 테마
    private String storyline;         // 스토리라인 / 세계관
    private String idea;              // 게임 아이디어 요약

    private String turnStructure;     // 턴 구조 설명
    private String victoryCondition;  // 승리 조건
    private List<String> actionRules; // 행동 규칙 리스트
    private List<String> penaltyRules;// 페널티 규칙 리스트

    private String designNote;

    private List<ComponentDto> components;// 게임 설계 관련 노트
}
