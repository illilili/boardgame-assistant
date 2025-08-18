import React, { useState, useEffect } from 'react';
import './ThumbnailGenerator.css';
import { getThumbnailPreview, generateThumbnail } from '../api/development';

function ThumbnailGenerator({ contentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState(null);
  const [error, setError] = useState('');

  const [manualId, setManualId] = useState(contentId || '');
  const [theme, setTheme] = useState('');
  const [storyline, setStoryline] = useState('');

  const isFromList = Boolean(contentId);
  const finalContentId = isFromList ? contentId : manualId;

  // 미리보기 불러오기
  useEffect(() => {
    if (!finalContentId) return;
    (async () => {
      try {
        const preview = await getThumbnailPreview(finalContentId);
        if (preview) {
          setTheme(preview.theme || '');
          setStoryline(preview.storyline || '');
        }
        const saved = localStorage.getItem(`thumbnail_${finalContentId}`);
        if (saved) setGeneratedThumbnail(JSON.parse(saved));
      } catch (err) {
        console.error(err);
        setError('썸네일 미리보기 불러오기 실패');
      }
    })();
  }, [finalContentId]);

  // 썸네일 생성
  const handleGenerateClick = async () => {
    if (!finalContentId) return setError('콘텐츠 ID를 입력하세요.');

    setIsLoading(true);
    setError('');

    try {
      const response = await generateThumbnail({
        contentId: finalContentId,
        theme,
        storyline,
      });
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
    if (finalContentId) localStorage.removeItem(`thumbnail_${finalContentId}`);
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
          {/* ID 입력 */}
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

          {/* 폼 입력 */}
          <div className="form-group"><label>테마</label>
            <input value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div className="form-group"><label>스토리라인</label>
            <textarea value={storyline} onChange={(e) => setStoryline(e.target.value)} rows={3} />
          </div>

          {/* 생성 버튼 */}
          {!generatedThumbnail && (
            <div className="generate-button-container">
              <button onClick={handleGenerateClick} className="generate-button">
                썸네일 생성하기
              </button>
            </div>
          )}

          {/* 결과 */}
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
