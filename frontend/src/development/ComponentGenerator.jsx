import React, { useState } from 'react';
import './ComponentGenerator.css'; // CSS 파일 이름도 통일성을 위해 변경합니다.

// --- 생성 가능한 구성 요소 종류 ---
const componentTypes = [
    { id: 'card', name: '카드', icon: '🃏' },
    { id: 'pawn', name: '말', icon: '♟️' },
    { id: 'figurine', name: '피규어', icon: '🤖' },
    { id: 'dice', name: '주사위', icon: '🎲' },
    { id: 'box', name: '박스', icon: '📦' },
    { id: 'rulebook', name: '룰북', icon: '📜' },
    { id: 'hourglass', name: '모래시계', icon: '⏳' },
    { id: 'etc', name: '기타 재료', icon: '💎' },
];

// --- 데모용 데이터 (기존 데이터 재활용) ---
const textOutputData = {
  generatedTexts: [
    { textId: 501, title: "차원의 균열", text: "이 카드를 사용하면 다음 턴에 상대의 자원을 1개 훔칠 수 있습니다. 단, 당신의 시간 에너지 -1" },
    { textId: 502, title: "고대의 망치", text: "공격 시 주사위 2개를 굴리고 높은 수를 선택하세요. 단, 한 번 사용 후 파괴됩니다." },
    { textId: 503, title: "지혜의 샘물", text: "이 카드를 사용하면 덱에서 카드 2장을 뽑습니다." },
  ]
};
const imageOutputData = { imageUrl: "https://i.pinimg.com/564x/ac/25/49/ac2549352613b19888f4c728770b553e.jpg" };
const imageOutputData2 = { imageUrl: "https://i.pinimg.com/564x/41/d3/18/41d318465e94080e75525979207a7605.jpg" };


function ComponentGenerator() {
    const [selectedType, setSelectedType] = useState(null); // 선택된 구성 요소 타입
    const [isTextLoading, setIsTextLoading] = useState(false);
    const [imageLoadingId, setImageLoadingId] = useState(null);
    const [generatedContent, setGeneratedContent] = useState(null);

    // 0단계: 생성할 구성 요소 타입을 선택
    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    // 1단계: 텍스트(콘텐츠) 생성
    const handleGenerateContent = () => {
        setIsTextLoading(true);
        setTimeout(() => {
            const initialContent = textOutputData.generatedTexts.map(item => ({ ...item, imageUrl: null }));
            setGeneratedContent(initialContent);
            setIsTextLoading(false);
        }, 1500);
    };

    // 2단계: 이미지 생성
    const handleGenerateImage = (textId) => {
        setImageLoadingId(textId);
        setTimeout(() => {
            const newImageUrl = textId === 502 ? imageOutputData2.imageUrl : imageOutputData.imageUrl;
            setGeneratedContent(currentContent =>
                currentContent.map(item =>
                    item.textId === textId ? { ...item, imageUrl: newImageUrl } : item
                )
            );
            setImageLoadingId(null);
        }, 2000);
    };

    // 초기화 또는 뒤로가기
    const handleReset = (step = 'all') => {
        if (step === 'content') {
            setGeneratedContent(null);
        } else {
            setSelectedType(null);
            setGeneratedContent(null);
        }
    };


    // --- 렌더링 로직 ---

    // 텍스트/이미지 생성 완료 후 화면
    if (selectedType && generatedContent) {
        return (
            <div className="component-placeholder">
                <div className="generation-success-header">
                    <h3>🎉 {selectedType.name} 콘텐츠가 생성되었습니다. 이미지를 생성해 보세요.</h3>
                    <button className="reset-button" onClick={() => handleReset('content')}>뒤로가기</button>
                </div>
                <div className="content-grid">
                    {generatedContent.map(item => (
                        <div key={item.textId} className="content-card">
                            <div className="card-image-section">
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="card-image" /> :
                                    <div className="card-image-placeholder">
                                        {imageLoadingId === item.textId ? <div className="loader"></div> : <span>이미지 생성 대기중</span>}
                                    </div>
                                }
                            </div>
                            <div className="card-text-section">
                                <h4 className="card-title">{item.title}</h4>
                                <p className="card-text">{item.text}</p>
                                {!item.imageUrl &&
                                    <button className="generate-image-button" disabled={imageLoadingId !== null} onClick={() => handleGenerateImage(item.textId)}>
                                        {imageLoadingId === item.textId ? '생성 중...' : '✨ 이미지 생성'}
                                    </button>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    // 타입 선택 후 텍스트 생성 전 화면
    if (selectedType) {
        return (
            <div className="component-placeholder">
                <button className="back-button" onClick={handleReset}>&larr; 종류 다시 선택</button>
                <h2>[개발] {selectedType.name} 문구/컨셉 생성</h2>
                <p>게임의 컨셉과 스타일에 맞는 {selectedType.name}의 이름과 효과를 생성합니다.</p>
                <div className="source-data-preview">
                    <h3>{selectedType.name} 생성 옵션</h3>
                    <p><strong>콘텐츠 타입:</strong> {selectedType.id}</p>
                    <p><strong>스타일:</strong> fantasy_illustration</p>
                </div>
                <div className="generate-button-container">
                    <button onClick={handleGenerateContent} disabled={isTextLoading} className="generate-button">
                        {isTextLoading ? '생성 중...' : `${selectedType.name} 생성하기`}
                    </button>
                </div>
            </div>
        )
    }

    // 맨 처음, 생성할 타입을 선택하는 화면
    return (
        <div className="component-placeholder">
            <h2>[개발] 카드/아이템 생성</h2>
            <p>생성하고 싶은 보드게임 구성 요소의 종류를 선택해 주세요.</p>
            <div className="type-selection-grid">
                {componentTypes.map(type => (
                    <div key={type.id} className="type-card" onClick={() => handleTypeSelect(type)}>
                        <div className="type-icon">{type.icon}</div>
                        <div className="type-name">{type.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ComponentGenerator;