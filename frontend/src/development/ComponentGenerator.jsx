// src/development/ComponentGenerator.jsx
import React, { useState, useEffect } from 'react';
import { getCardPreview, generateCardText, generateCardImage } from '../api/development';
import './ComponentGenerator.css';

function ComponentGenerator({ textContentId, imageContentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [cardData, setCardData] = useState({ name: '', effect: '', description: '' });
  const [previewInfo, setPreviewInfo] = useState({ theme: '', storyline: '' });
  const [generatedResult, setGeneratedResult] = useState({ text: null, imageUrl: null });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  // 프리뷰 + 로컬스토리지 불러오기
  useEffect(() => {
    const fetchData = async () => {
      const targetId = textContentId || imageContentId;
      if (!targetId) return;

      setIsLoading(true);
      setLoadingMessage('카드 정보 불러오는 중...');
      try {
        const preview = await getCardPreview(targetId);
        if (preview) {
          setCardData({
            name: preview.name || '',
            effect: preview.effect || '',
            description: preview.description || preview.imageDescription || '',
          });
          setPreviewInfo({
            theme: preview.theme || '',
            storyline: preview.storyline || '',
          });
        }

        // 🔹 텍스트 기준으로 로드 + 이미지 추가
        let restored = {};
        if (textContentId) {
          const savedText = localStorage.getItem(`card_${textContentId}`);
          if (savedText) restored = { ...JSON.parse(savedText) };
        }
        if (imageContentId) {
          const savedImage = localStorage.getItem(`card_${imageContentId}`);
          if (savedImage) restored = { ...restored, ...JSON.parse(savedImage) };
        }
        if (Object.keys(restored).length > 0) setGeneratedResult(restored);

      } catch (err) {
        console.error(err);
        setError('미리보기 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };

    fetchData();
  }, [textContentId, imageContentId]);

  // 결과 저장
  useEffect(() => {
    if (textContentId && generatedResult.text) {
      localStorage.setItem(`card_${textContentId}`, JSON.stringify({ text: generatedResult.text }));
    }
    if (imageContentId && generatedResult.imageUrl) {
      localStorage.setItem(`card_${imageContentId}`, JSON.stringify({ imageUrl: generatedResult.imageUrl }));
    }
  }, [generatedResult, textContentId, imageContentId]);

  // 텍스트 생성
  const handleGenerateText = async () => {
    if (!textContentId) return;
    setIsLoading(true);
    setLoadingMessage('카드 텍스트 생성 중...');
    setError('');
    try {
      const requestData = { contentId: textContentId, ...cardData };
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

  // 이미지 생성
  const handleGenerateImage = async () => {
    if (!imageContentId) return;
    setIsLoading(true);
    setLoadingMessage('카드 이미지 생성 중...');
    setError('');
    try {
      const requestData = { contentId: imageContentId, ...cardData };
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

  // 초기화
  const handleReset = () => {
    setGeneratedResult({ text: null, imageUrl: null });
    setError('');
    if (textContentId) localStorage.removeItem(`card_${textContentId}`);
    if (imageContentId) localStorage.removeItem(`card_${imageContentId}`);
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
                <button
                  onClick={handleGenerateText}
                  className="generate-button text-btn"
                  disabled={!textContentId}
                >
                  텍스트 생성하기
                </button>
                <button
                  onClick={handleGenerateImage}
                  className="generate-button image-btn"
                  disabled={!imageContentId}
                >
                  이미지 생성하기
                </button>
              </div>
            )}
          </div>

          {hasResult && (
            <div className="card-result-container">
              <h3>🎉 생성 완료!</h3>
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
                {!generatedResult.text && textContentId &&
                  <button onClick={handleGenerateText} className="generate-button text-btn">텍스트 생성</button>
                }
                {!generatedResult.imageUrl && imageContentId &&
                  <button onClick={handleGenerateImage} className="generate-button image-btn">이미지 생성</button>
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
