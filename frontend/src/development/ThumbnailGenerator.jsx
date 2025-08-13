import React, { useState, useEffect } from 'react';
import './ThumbnailGenerator.css';
import { generateThumbnail } from '../api/development';

function ThumbnailGenerator({ contentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState(() => {
    if (!contentId) return null;
    const saved = localStorage.getItem(`thumbnail_${contentId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState('');
  const [manualId, setManualId] = useState(contentId || '');

  const isFromList = Boolean(contentId); // 개발 목록에서 온 경우
  const finalContentId = isFromList ? contentId : manualId;

  useEffect(() => {
    if (finalContentId) {
      const saved = localStorage.getItem(`thumbnail_${finalContentId}`);
      if (saved) setGeneratedThumbnail(JSON.parse(saved));
    }
  }, [finalContentId]);

  const handleGenerateClick = async () => {
    if (!finalContentId) {
      setError('콘텐츠 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await generateThumbnail({ contentId: finalContentId });
      setGeneratedThumbnail(response);
      localStorage.setItem(`thumbnail_${finalContentId}`, JSON.stringify(response));
    } catch (err) {
      console.error(err);
      setError('썸네일 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedThumbnail(null);
    setError('');
    if (finalContentId) {
      localStorage.removeItem(`thumbnail_${finalContentId}`);
    }
  };

  return (
    <div className="component-placeholder">
      {isLoading && (
        <div className="status-container">
          <div className="loader"></div>
          <h3>썸네일 생성 중...</h3>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!isLoading && (
        <>
          {/* ID 입력/표시 영역 */}
          <div className="id-input-container">
            <label>콘텐츠 ID</label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => !isFromList && setManualId(e.target.value)}
              placeholder="콘텐츠 ID 입력"
              disabled={isFromList}
            />
          </div>

          {/* 생성 전 상태 */}
          {!generatedThumbnail && (
            <div className="generate-button-container">
              <button onClick={handleGenerateClick} className="generate-button">
                썸네일 생성하기
              </button>
            </div>
          )}

          {/* 생성 완료 상태 */}
          {generatedThumbnail && (
            <div className="thumbnail-result-container">
              <h3>🎉 생성 완료!</h3>
              <img
                src={generatedThumbnail.thumbnailUrl}
                alt="thumbnail"
                className="thumbnail-image"
              />
              <div className="thumbnail-info">
                <span>콘텐츠 ID: {generatedThumbnail.contentId}</span>
              </div>
              <button onClick={handleReset} className="reset-button-bottom">
                다시 생성
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ThumbnailGenerator;
