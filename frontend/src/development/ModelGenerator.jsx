import React, { useState, useEffect } from 'react';
import './ModelGenerator.css';
import { getModel3DPreview, generate3DModel } from '../api/development';

function ModelGenerator({ contentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedModel, setGeneratedModel] = useState(null);
  const [error, setError] = useState('');

  const [manualId, setManualId] = useState(contentId || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [componentInfo, setComponentInfo] = useState('');
  const [theme, setTheme] = useState('');
  const [storyline, setStoryline] = useState('');
  const [style, setStyle] = useState('');

  const isFromList = Boolean(contentId);
  const finalContentId = isFromList ? contentId : manualId;

  // camelCase 변환 함수
  const normalizeModelKeys = (data) => {
    if (!data) return null;
    return {
      ...data,
      previewUrl: data.preview_url || data.previewUrl || '',
      refinedUrl: data.refined_url || data.refinedUrl || ''
    };
  };

  useEffect(() => {
    if (!finalContentId) return;
    (async () => {
      try {
        const preview = await getModel3DPreview(finalContentId);
        if (preview) {
          setName(preview.name || '');
          setDescription(preview.description || '');
          setComponentInfo(preview.artConcept || '');
          setTheme(preview.theme || '');
          setStoryline(preview.storyline || '');
        }
        const saved = localStorage.getItem(`model3d_${finalContentId}`);
        if (saved) {
          setGeneratedModel(normalizeModelKeys(JSON.parse(saved)));
        }
      } catch (err) {
        console.error(err);
        setError('3D 모델 미리보기 불러오기 실패');
      }
    })();
  }, [finalContentId]);

  const handleGenerateClick = async () => {
    if (!finalContentId) return setError('콘텐츠 ID를 입력하세요.');
    if (!style) return setError('스타일을 선택하세요.');
    setIsLoading(true);
    setError('');

    try {
      const response = await generate3DModel({
        contentId: finalContentId,
        name,
        description,
        componentInfo,
        theme,
        storyline,
        style
      });

      const formatted = normalizeModelKeys(response);
      setGeneratedModel(formatted);
      localStorage.setItem(`model3d_${finalContentId}`, JSON.stringify(formatted));
    } catch (err) {
      console.error(err);
      setError('3D 모델 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };


  const handleReset = () => {
    setGeneratedModel(null);
    setError('');
    if (finalContentId) localStorage.removeItem(`model3d_${finalContentId}`);
  };

  return (
    <div className="component-placeholder">
      {isLoading && (
        <div className="status-container">
          <div className="loader"></div>
          <h3>3D 모델 생성 중...</h3>
        </div>
      )}

      {error && <div className="error-container"><p>{error}</p></div>}

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

          {/* 폼 필드 */}
          <div className="form-group"><label>이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group"><label>설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="form-group"><label>아트 컨셉</label>
            <input value={componentInfo} onChange={(e) => setComponentInfo(e.target.value)} />
          </div>
          <div className="form-group"><label>테마</label>
            <input value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div className="form-group"><label>스토리라인</label>
            <textarea value={storyline} onChange={(e) => setStoryline(e.target.value)} rows={3} />
          </div>
          <div className="form-group"><label>스타일</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="">스타일 선택</option>
              <option value="realistic">Realistic</option>
              <option value="sculpture">Sculpture</option>
            </select>
          </div>

          {/* 생성 버튼 */}
          {!generatedModel && (
            <div className="generate-button-container">
              <button onClick={handleGenerateClick} className="generate-button">
                3D 모델 생성하기
              </button>
            </div>
          )}

          {/* 결과 */}
          {generatedModel && (
            <div className="model-result-container">
              <div className="model-viewer-wrapper">
                {(generatedModel.refinedUrl || generatedModel.previewUrl) ? (
                  <model-viewer
                    src={generatedModel.refinedUrl || generatedModel.previewUrl}
                    alt={generatedModel.name}
                    auto-rotate
                    camera-controls
                    style={{ width: '100%', height: '500px' }}
                  ></model-viewer>
                ) : (
                  <p>3D 미리보기를 표시할 수 없습니다.</p>
                )}
              </div>
              <div className="model-info-wrapper">
                <h3>🎉 생성 완료!</h3>
                <div className="info-item">
                  <strong>이름</strong><span>{generatedModel.name}</span>
                </div>
                {(generatedModel.refinedUrl || generatedModel.previewUrl) && (
                  <div className="download-links">
                    {generatedModel.refinedUrl && (
                      <a href={generatedModel.refinedUrl} target="_blank" rel="noreferrer">
                        GLB 다운로드
                      </a>
                    )}
                    {generatedModel.previewUrl && (
                      <a href={generatedModel.previewUrl} target="_blank" rel="noreferrer">
                        미리보기 링크
                      </a>
                    )}
                  </div>
                )}
                <button onClick={handleReset} className="reset-button">
                  다시 생성
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ModelGenerator;
