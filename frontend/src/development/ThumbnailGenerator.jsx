import React, { useState } from 'react';
import './ThumbnailGenerator.css'; // 전용 CSS 파일을 import 합니다.

// --- 입력 및 출력 데이터 (데모용) ---
const thumbnailInputParams = {
    planId: 1012,
    projectTitle: "드래곤의 전설",
    theme: "판타지",
    storyline: "용의 힘을 얻은 기사가 악의 마왕을 물리치는 모험"
};

const thumbnailOutputData = {
  thumbnailId: 5007,
  // 웹에서 바로 볼 수 있는 판타지 아트 예시 이미지 링크입니다.
  thumbnailUrl: "https://i.pinimg.com/564x/08/9d/f3/089df31968549f39edce357833898667.jpg"
};


function ThumbnailGenerator() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedThumbnail, setGeneratedThumbnail] = useState(null);

    const handleGenerateClick = () => {
        setIsLoading(true);
        // 실제 API 호출을 시뮬레이션합니다 (2초 지연)
        setTimeout(() => {
            setGeneratedThumbnail(thumbnailOutputData);
            setIsLoading(false);
        }, 2000);
    };

    const handleReset = () => {
        setGeneratedThumbnail(null);
    };

    // --- 렌더링 로직 ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="status-container">
                    <div className="loader"></div>
                    <h3>썸네일 생성 중...</h3>
                    <p>AI가 프로젝트 컨셉에 맞춰 이미지를 조합하고 있습니다.</p>
                </div>
            );
        }

        if (generatedThumbnail) {
            return (
                <div className="thumbnail-result-container">
                    <h3>🎉 썸네일 생성이 완료되었습니다!</h3>
                    <div className="thumbnail-image-wrapper">
                        <img 
                            src={generatedThumbnail.thumbnailUrl} 
                            alt={`${thumbnailInputParams.projectTitle} Thumbnail`}
                            className="thumbnail-image"
                        />
                    </div>
                    <div className="thumbnail-info">
                        <span>썸네일 ID: {generatedThumbnail.thumbnailId}</span>
                        <a 
                            href={generatedThumbnail.thumbnailUrl} 
                            download={`${thumbnailInputParams.projectTitle}_thumbnail.png`}
                            className="download-button"
                        >
                            이미지 다운로드
                        </a>
                    </div>
                    <button className="reset-button-bottom" onClick={handleReset}>새로 생성하기</button>
                </div>
            )
        }

        // 초기 화면
        return (
            <>
                <h2>[개발] 썸네일 이미지 생성</h2>
                <p>프로젝트의 제목, 테마, 스토리 정보를 바탕으로 홍보용 썸네일을 생성합니다.</p>
                <div className="source-data-preview">
                    <h3>생성 기반 정보</h3>
                    <p><strong>프로젝트 제목:</strong> {thumbnailInputParams.projectTitle}</p>
                    <p><strong>테마:</strong> {thumbnailInputParams.theme}</p>
                    <p><strong>핵심 스토리:</strong> {thumbnailInputParams.storyline}</p>
                </div>
                <div className="generate-button-container">
                    <button onClick={handleGenerateClick} className="generate-button">
                        썸네일 생성하기
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

export default ThumbnailGenerator;