import React, { useState } from 'react';
import './ScriptGenerator.css'; // 전용 CSS 파일을 import 합니다.

// --- 입력 데이터 (사용자가 선택한 생성 옵션) ---
const inputScriptParams = {
  planId: 1012,
  target: "youtube_video",  
  length: "short",        
  tone: "friendly"        
};

// --- 출력 데이터 (서버에서 생성된 스크립트 데이터) ---
const outputScriptData = {
    status: "SUCCESS",
    message: "설명 스크립트가 성공적으로 생성되었습니다.",
    planId: 6,
    target: "youtube",
    script: {
        title: "탐정이 되어 추리해보자! 『미스터리 탐정 6』 게임 리뷰!",
        body: [
            "인사말 및 게임 소개",
            "(00:00~01:00)",
            "안녕하세요, 여러분! 저는 보드게임 리뷰어, 보게락입니다. 오늘은 매력적이고 다양한 추리 요소가 가득한 게임, 바로 『미스터리 탐정 6』을 소개해드리려고 합니다. 이 게임은 3-6명의 플레이어가 참여 가능하며, 대략적인 플레이 시간은 60~90분이에요.",
            "게임의 배경과 테마 설명",
            "(01:01~02:30)",
            "『미스터리 탐정 6』은 1920년대 런던을 배경으로 살인 사건을 해결하는 탐정들의 이야기입니다. 여러분들은 각각 다른 탐정이 되어 단서를 수집하고 범인을 찾아야 해요. 저택 지도와 단서 카드가 있고, 이들은 각각 플레이어들이 이동할 수 있는 공간과 사건 해결에 필요한 정보를 제공해주죠.",
            "핵심 게임 규칙 간단 설명",
            "(02:31~06:00)",
            "게임은 시계방향으로 진행되며, 각 턴마다 2개의 행동을 할 수 있어요. '이동', '조사', '추론', '고발' 가능하죠. 이동은 인접한 방으로 이동할 수 있고, 조사는 현재 위치에서 단서 카드를 뽑을 수 있어요. 추론은 다른 플레이어에게 질문을 하고, 고발은 범인이라고 생각하는 플레이어를 지목할 수 있습니다.",
            "게임의 재미 요소와 매력 포인트",
            "(06:01~08:00)",
            "재미있는 것은, 잘못된 고발을 하거나 같은 방에 3턴 연속 머무르면 단서 카드를 반납해야 하고, 거짓 증언 적발 시 패널티 카드를 받게 됩니다. 따라서 이 게임은 단순한 운빨 게임이 아닌, 참여자들의 전략적인 생각과 질문 능력이 중요한 게임이랍니다.",
            "추천 대상 및 마무리 인사",
            "(08:01~10:00)",
            "12세 이상 추리 게임을 좋아하는 분들에게 강력 추천하는 게임입니다. 집에서 친구들과 모여서 미스터리 탐정 6을 즐겨보는 것 어떨까요? 처음 시작할 때는 간단한 시나리오로 시작하면 좋을 것 같아요. 그럼 이만! 즐거운 보드게임 시간 되시길 바랍니다."
        ]
    },
    estimatedDuration: "약 10분",
    timestamp: "2025-08-04T15:45:16.346233"
};

// 스크립트 본문의 각 라인을 종류에 따라 다른 스타일로 렌더링하는 컴포넌트
const ScriptLine = ({ line }) => {
    if (line.startsWith('(') && line.endsWith(')')) {
        return <p className="script-timestamp">{line}</p>;
    }
    const headers = ["인사말 및 게임 소개", "게임의 배경과 테마 설명", "핵심 게임 규칙 간단 설명", "게임의 재미 요소와 매력 포인트", "추천 대상 및 마무리 인사"];
    if (headers.includes(line)) {
        return <h5 className="script-section-header">{line}</h5>;
    }
    return <p className="script-body-text">{line}</p>;
};

function ScriptGenerator() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState(null);

    const handleGenerateClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setGeneratedScript(outputScriptData);
            setIsLoading(false);
        }, 1500);
    };

    const handleReset = () => {
        setGeneratedScript(null);
    };

    const handleCopyToClipboard = () => {
        const scriptText = generatedScript.script.title + '\n\n' + generatedScript.script.body.join('\n');
        navigator.clipboard.writeText(scriptText)
            .then(() => alert('스크립트가 클립보드에 복사되었습니다!'))
            .catch(err => alert('복사에 실패했습니다.'));
    };

    // 생성 완료 후 화면
    if (generatedScript) {
        return (
            <div className="component-placeholder">
                <div className="generation-success-header">
                    <h3>🎉 {generatedScript.message}</h3>
                    <div className="header-buttons">
                        <button className="copy-button" onClick={handleCopyToClipboard}>클립보드에 복사</button>
                        <button className="reset-button" onClick={handleReset}>새로 생성하기</button>
                    </div>
                </div>
                <div className="script-display">
                    <h3 className="script-title">{generatedScript.script.title}</h3>
                    <p className="script-meta">예상 소요 시간: {generatedScript.estimatedDuration}</p>
                    <div className="script-body">
                        {generatedScript.script.body.map((line, index) => (
                            <ScriptLine key={index} line={line} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 생성 전 초기 화면
    return (
        <div className="component-placeholder">
            <h2>[개발] 설명 스크립트 자동 생성</h2>
            <p>유튜브 영상, 상세 페이지 등 원하는 목적에 맞는 설명 스크립트를 생성합니다.</p>
            
            <div className="source-data-preview">
                <h3>스크립트 생성 옵션</h3>
                <p><strong>대상 플랫폼:</strong> {inputScriptParams.target}</p>
                <p><strong>분량:</strong> {inputScriptParams.length}</p>
                <p><strong>어조:</strong> {inputScriptParams.tone}</p>
            </div>

            <div className="generate-button-container">
                <button 
                    onClick={handleGenerateClick} 
                    disabled={isLoading}
                    className="generate-button"
                >
                    {isLoading ? '스크립트 생성 중...' : '설명 스크립트 생성하기'}
                </button>
            </div>
        </div>
    );
}

export default ScriptGenerator;