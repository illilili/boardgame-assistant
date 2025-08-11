import React, { useState } from 'react';
import './RulebookGenerator.css'; // 전용 CSS 파일을 import 합니다.

// --- 입력 데이터 (사용자가 제공한 기획안 데이터) ---
const inputPlanData = {
    projectId: 1,
    planId: 1,
    rulebookTitle: "미스터리 탐정 보드게임",
    theme: "추리/미스터리",
    storyline: "1920년대 런던을 배경으로 한 살인 사건을 해결하는 탐정들의 이야기. 플레이어들은 각각 다른 탐정이 되어 단서를 수집하고 범인을 찾아야 합니다.",
    // ... (나머지 입력 데이터는 생략) ...
};

// --- 출력 데이터 (서버에서 생성된 룰북 데이터) ---
const outputRulebookData = {
    status: "SUCCESS",
    message: "룰북이 성공적으로 생성되었습니다.",
    rule_data: {
        rule_bookTitle: "미스터리 탐정 보드게임",
        rule_storyline: "1920년대, 런던의 한 저택에서 발생한 살인 사건. 플레이어들은 각각 다른 탐정이 되어 미스터리를 해결하기 위해 단서를 수집하게 됩니다. 숨겨진 단서들, 은밀한 증인의 증언, 그리고 끊임없이 변하는 상황 속에서 진실을 찾아내야합니다. 범인은 누구일까요? 사용된 무기는 무엇일까요? 그리고 범죄가 발생한 장소는 어디일까요? 플레이어들은 이 질문들의 답을 찾아내면서 런던이라는 도시에 퍼져있는 미스터리를 해결해야 합니다.",
        rule_components: "1. 단서 카드: 일러스트가 포함된 카드로 사건 해결에 필요한 정보를 제공합니다. (수량: 게임 인원에 따라 다름)\n2. 저택 지도: 플레이어들이 이동할 수 있는 공간을 나타낸 보드. (수량: 1)",
        rule_age: "12세 이상 추리 게임을 좋아하는 사람들",
        rule_setup: "1. 모든 플레이어는 한 탐정을 선택해 자신의 캐릭터로 삼습니다.\n2. 단서 카드를 무작위로 뽑아 범인, 무기, 장소를 결정합니다. 이 카드들은 나머지 카드와 분리되어 게임이 끝날 때까지 공개되지 않습니다.\n3. 남은 단서 카드를 모두 섞은 후, 플레이어들에게 균등하게 분배합니다.\n4. 각 플레이어는 자신의 단서 카드를 확인한 후, 게임 시작 위치에 자신의 캐릭터를 배치합니다.",
        rule_set: "1. 플레이어는 각 턴마다 2개의 행동을 할 수 있습니다.\n2. 이동: 인접한 방으로 이동할 수 있습니다.\n3. 조사: 현재 위치에서 단서 카드를 뽑을 수 있습니다.\n4. 추론: 다른 플레이어에게 질문을 할 수 있습니다.\n5. 고발: 범인이라고 생각하는 플레이어를 지목할 수 있습니다.\n6. 잘못된 고발 시 한 턴 쉬기\n7. 같은 방에 3턴 연속 머물 시 단서 카드 1장 반납\n8. 거짓 증언 적발 시 패널티 카드 받기",
        rule_progress: "1. 시계방향으로 턴을 진행하며, 각 턴마다 2개의 행동을 할 수 있습니다.\n2. 플레이어는 이동, 조사, 추론, 고발 중에서 원하는 행동을 선택하여 진행합니다.\n3. 다른 플레이어에게 질문을 할 경우, 그 플레이어는 진실을 말해야 합니다.\n4. 범인을 찾아낼 때까지 게임은 계속됩니다.",
        rule_win_condition: "정확한 범인, 무기, 장소를 모두 맞춘 플레이어가 승리합니다.",
        turn_order: "1. 이동 or 조사\n2. 이동 or 조사 or 추론 or 고발\n3. 다른 플레이어의 턴\n4. 특별 규칙\n- 같은 방에 3턴 연속 머물 시 단서 카드 1장을 게임 진행자에게 반납해야 합니다.\n- 거짓 증언이 적발될 경우, 패널티 카드를 받게 됩니다. 패널티 카드는 다음 턴에 사용할 수 있는 행동을 1개 줄입니다.",
        project_id: 1
    },
    pdfUrl: "https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/rulebooks/rulebook_6_20250804_154428.pdf",
    timestamp: "2025-07-30T18:11:33.972219"
};


// 줄바꿈(\n) 문자를 <br> 태그로 바꿔주는 헬퍼 컴포넌트
const NewlineText = ({ text }) => {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br />
        </React.Fragment>
    ));
};

function RulebookGenerator() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState(null);

    const handleGenerateClick = () => {
        setIsLoading(true);
        // 실제 API 호출을 시뮬레이션합니다 (1.5초 지연)
        setTimeout(() => {
            setGeneratedData(outputRulebookData);
            setIsLoading(false);
        }, 1500);
    };

    const handleReset = () => {
        setGeneratedData(null);
    }

    if (generatedData) {
        return (
            <div className="component-placeholder">
                <div className="generation-success-header">
                    <h3>🎉 {generatedData.message}</h3>
                    <div className="header-buttons">
                        <button 
                            className="pdf-button" 
                            onClick={() => window.open(generatedData.pdfUrl, '_blank')}
                        >
                            PDF 다운로드
                        </button>
                        <button className="reset-button" onClick={handleReset}>새로 생성하기</button>
                    </div>
                </div>

                <div className="rulebook-display">
                    <h2>{generatedData.rule_data.rule_bookTitle}</h2>

                    <div className="rulebook-section">
                        <h4>스토리라인</h4>
                        <p>{generatedData.rule_data.rule_storyline}</p>
                    </div>
                    <div className="rulebook-section">
                        <h4>게임 구성물</h4>
                        <p><NewlineText text={generatedData.rule_data.rule_components} /></p>
                    </div>
                    <div className="rulebook-section">
                        <h4>게임 준비</h4>
                        <p><NewlineText text={generatedData.rule_data.rule_setup} /></p>
                    </div>
                    <div className="rulebook-section">
                        <h4>게임 규칙</h4>
                        <p><NewlineText text={generatedData.rule_data.rule_set} /></p>
                    </div>
                    <div className="rulebook-section">
                        <h4>게임 진행</h4>
                        <p><NewlineText text={generatedData.rule_data.rule_progress} /></p>
                    </div>
                    <div className="rulebook-section">
                        <h4>승리 조건</h4>
                        <p>{generatedData.rule_data.rule_win_condition}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="component-placeholder">
            <h2>[개발] 룰북 초안 자동 생성</h2>
            <p>선택된 기획안의 데이터를 기반으로 AI가 룰북 초안을 생성합니다.</p>
            
            <div className="source-data-preview">
                <h3>생성 기반 기획안</h3>
                <p><strong>제목:</strong> {inputPlanData.rulebookTitle}</p>
                <p><strong>테마:</strong> {inputPlanData.theme}</p>
                <p><strong>스토리:</strong> {inputPlanData.storyline}</p>
            </div>

            <div className="generate-button-container">
                <button 
                    onClick={handleGenerateClick} 
                    disabled={isLoading}
                    className="generate-button"
                >
                    {isLoading ? '룰북 생성 중...' : '룰북 초안 생성하기'}
                </button>
            </div>
        </div>
    );
}

export default RulebookGenerator;