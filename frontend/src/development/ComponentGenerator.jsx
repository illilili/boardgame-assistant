import React, { useState, useEffect } from 'react';
import { getCardPreview, generateCardText, generateCardImage } from '../api/development';
import './ComponentGenerator.css';

function ComponentGenerator({ contentId }) {
  // 상태 관리 (변경 없음)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [cardData, setCardData] = useState({ name: '', effect: '', description: '' });
  const [previewInfo, setPreviewInfo] = useState({ theme: '', storyline: '' });
  const [generatedResult, setGeneratedResult] = useState({ text: null, imageUrl: null });

  // 핸들러 및 useEffect (변경 없음)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!contentId) return;
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingMessage('카드 정보 불러오는 중...');
      try {
        const preview = await getCardPreview(contentId);
        if (preview) {
          setCardData({
            name: preview.name || '',
            effect: preview.effect || '',
            description: preview.description || '',
          });
          setPreviewInfo({
            theme: preview.theme || 'N/A',
            storyline: preview.storyline || 'N/A',
          });
        }
        const saved = localStorage.getItem(`card_${contentId}`);
        if (saved) {
          setGeneratedResult(JSON.parse(saved));
        }
      } catch (err) {
        console.error(err);
        setError('미리보기 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };
    fetchData();
  }, [contentId]);

  useEffect(() => {
    if (contentId && (generatedResult.text || generatedResult.imageUrl)) {
      localStorage.setItem(`card_${contentId}`, JSON.stringify(generatedResult));
    }
  }, [generatedResult, contentId]);

  const handleGenerateText = async () => {
    setIsLoading(true);
    setLoadingMessage('카드 텍스트 생성 중...');
    setError('');
    try {
      const requestData = { contentId, ...cardData };
      const response = await generateCardText(requestData);
      const resultText = response.generated_texts[0].text;
      setGeneratedResult(prev => ({ ...prev, text: resultText }));
    } catch (err) {
      setError('카드 텍스트 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerateImage = async () => {
    setIsLoading(true);
    setLoadingMessage('카드 이미지 생성 중...');
    setError('');
    try {
      const requestData = { contentId, ...cardData };
      const response = await generateCardImage(requestData);
      const resultImage = response.generated_images[0].imageUrl;
      setGeneratedResult(prev => ({ ...prev, imageUrl: resultImage }));
    } catch (err) {
      setError('카드 이미지 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleReset = () => {
    setGeneratedResult({ text: null, imageUrl: null });
    setError('');
    if (contentId) {
      localStorage.removeItem(`card_${contentId}`);
    }
  };

  const hasResult = generatedResult.text || generatedResult.imageUrl;

  return (
    <div className="component-placeholder card-generator">
      <h2>[개발] 카드 생성</h2>
      <p>카드의 이름, 효과, 설명을 입력하고 텍스트와 이미지를 생성합니다.</p>

      {isLoading && (
        <div className="status-container">
          <div className="loader"></div>
          <h3>{loadingMessage}</h3>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!isLoading && (
        <div className="card-gen-content">
          <div className="card-gen-form">
            <div className="concept-info">
              <h3>기본 컨셉 정보</h3>
              <p><strong>테마:</strong> {previewInfo.theme}</p>
              <p><strong>스토리라인:</strong> {previewInfo.storyline}</p>
            </div>
            
            <div className="form-group">
              <label>카드 이름</label>
              <input type="text" name="name" value={cardData.name} onChange={handleInputChange} placeholder="카드 이름 입력" />
            </div>
            <div className="form-group">
              <label>카드 효과</label>
              <textarea name="effect" value={cardData.effect} onChange={handleInputChange} placeholder="카드 효과 입력" rows={4} />
            </div>
            <div className="form-group">
              <label>카드 설명 (이미지 생성 시 참고)</label>
              <textarea name="description" value={cardData.description} onChange={handleInputChange} placeholder="카드에 대한 부가 설명이나 아트 컨셉 입력" rows={4} />
            </div>

            {!hasResult && (
              <div className="generate-buttons-container">
                <button onClick={handleGenerateText} className="generate-button text-btn">텍스트 생성하기</button>
                <button onClick={handleGenerateImage} className="generate-button image-btn">이미지 생성하기</button>
              </div>
            )}
          </div>

          {/* 🚨 [수정] 생성 결과 표시부를 하나로 통합했습니다. */}
          {hasResult && (
            <div className="card-result-container">
              <h3>🎉 생성 완료!</h3>
              
              {/* 카드 미리보기 형태로 통합 */}
              <div className="generated-card-preview">
                {generatedResult.imageUrl ? (
                  <img src={generatedResult.imageUrl} alt="Generated Card" className="card-image" />
                ) : (
                  <div className="image-placeholder">이미지를 생성해 주세요.</div>
                )}
                
                {generatedResult.text ? (
                  <div className="card-text-area">
                    <p>{generatedResult.text}</p>
                  </div>
                ) : (
                  <div className="text-placeholder">텍스트를 생성해 주세요.</div>
                )}
              </div>

              <div className="result-actions">
                <button onClick={handleReset} className="reset-button-bottom">
                  다시 생성
                </button>
                {/* 텍스트나 이미지가 하나만 생성되었을 경우, 마저 생성할 수 있는 버튼을 보여줍니다. */}
                {!generatedResult.text && 
                  <button onClick={handleGenerateText} className="generate-button text-btn">텍스트 마저 생성</button>
                }
                {!generatedResult.imageUrl &&
                  <button onClick={handleGenerateImage} className="generate-button image-btn">이미지 마저 생성</button>
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComponentGenerator;