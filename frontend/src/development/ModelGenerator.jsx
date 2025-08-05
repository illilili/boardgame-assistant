import React, { useState } from 'react';
import './ModelGenerator.css'; // 전용 CSS 파일을 import 합니다.

// --- 입력 및 출력 데이터 (데모용) ---
const modelInputParams = { planId: 1012, textId: 501, contentType: "card_image", style: "fantasy_illustration" };
const modelOutputData = {
  modelId: 9012,
  // 웹에서 바로 볼 수 있는 공개 .glb 모델 예시 링크입니다.
  previewUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", 
  refinedUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  status: "completed"
};

function ModelGenerator() {
    const [isLoading, setIsLoading] = useState(false);
    const [modelData, setModelData] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerateClick = () => {
        setIsLoading(true);
        setError(null);
        setModelData(null);
        
        // 실제 API 호출을 시뮬레이션합니다 (3D 모델링은 시간이 걸리는 것처럼 3초로 설정)
        setTimeout(() => {
            // 데모를 위해 80% 확률로 성공, 20% 확률로 실패하도록 설정
            if (Math.random() < 0.8) {
                setModelData(modelOutputData);
            } else {
                setError("모델 생성에 실패했습니다. 서버 상태를 확인하거나 잠시 후 다시 시도해 주세요.");
            }
            setIsLoading(false);
        }, 3000);
    };

    const handleReset = () => {
        setIsLoading(false);
        setModelData(null);
        setError(null);
    };
    
    // --- 렌더링 로직 ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="status-container">
                    <div className="loader"></div>
                    <h3>3D 모델 생성 중...</h3>
                    <p>AI가 열심히 모델을 만들고 있습니다. 잠시만 기다려 주세요.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="status-container error-container">
                    <h3>❌ 생성 실패</h3>
                    <p>{error}</p>
                    <button className="generate-button" onClick={handleGenerateClick}>다시 시도</button>
                </div>
            )
        }

        if (modelData) {
            return (
                <div className="model-result-container">
                    <div className="model-viewer-wrapper">
                        {/* 이 부분이 3D 모델을 보여주는 핵심입니다! */}
                        <model-viewer
                            src={modelData.previewUrl}
                            alt="A 3D model"
                            ar
                            camera-controls
                            auto-rotate
                            shadow-intensity="1"
                        ></model-viewer>
                    </div>
                    <div className="model-info-wrapper">
                        <h3>🎉 모델 생성이 완료되었습니다!</h3>
                        <div className="info-item">
                            <strong>모델 ID:</strong>
                            <span>{modelData.modelId}</span>
                        </div>
                        <div className="info-item">
                            <strong>상태:</strong>
                            <span className="status-badge status-completed">{modelData.status}</span>
                        </div>
                        <div className="download-links">
                            <a href={modelData.previewUrl} download>프리뷰 모델 다운로드 (.glb)</a>
                            <a href={modelData.refinedUrl} download>고품질 모델 다운로드 (.glb)</a>
                        </div>
                        <button className="reset-button" onClick={handleReset}>새로 생성하기</button>
                    </div>
                </div>
            )
        }

        // 초기 화면
        return (
            <>
                <h2>[개발] 3D 모델 생성</h2>
                <p>텍스트나 컨셉을 기반으로 게임에 사용할 3D 모델을 생성합니다.</p>
                <div className="source-data-preview">
                    <h3>모델 생성 옵션</h3>
                    <p><strong>콘텐츠 타입:</strong> {modelInputParams.contentType}</p>
                    <p><strong>스타일:</strong> {modelInputParams.style}</p>
                </div>
                <div className="generate-button-container">
                    <button onClick={handleGenerateClick} className="generate-button">
                        3D 모델 생성하기
                    </button>
                </div>
            </>
        )
    }

    return (
        <div className="component-placeholder">
            {renderContent()}
        </div>
    );
}

export default ModelGenerator;