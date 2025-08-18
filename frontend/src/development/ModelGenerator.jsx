import React, { useState, useEffect, useCallback } from 'react';
import './ModelGenerator.css';
import {
  getModel3DPreview,
  generate3DModel,
  saveContentVersion,
  getContentVersions,
  rollbackContentVersion,
  getContentDetail,
  completeContent,
  submitComponent
} from '../api/development';

function ModelGenerator({ contentId, componentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedModel, setGeneratedModel] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [manualId, setManualId] = useState(contentId || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [componentInfo, setComponentInfo] = useState('');
  const [theme, setTheme] = useState('');
  const [storyline, setStoryline] = useState('');
  const [style, setStyle] = useState('');

  const isFromList = Boolean(contentId);
  const finalContentId = isFromList ? contentId : manualId;

  // 버전 관리 상태
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionNote, setVersionNote] = useState('3D 모델 스냅샷');

  // camelCase 변환
  const normalizeModelKeys = (data) => {
    if (!data) return null;
    return {
      ...data,
      previewUrl: data.preview_url || data.previewUrl || '',
      refinedUrl: data.refined_url || data.refinedUrl || ''
    };
  };

  // 버전 목록 불러오기
  const fetchVersions = useCallback(async () => {
    if (!finalContentId) return;
    try {
      const list = await getContentVersions(finalContentId);
      setVersions(list);
      if (list.length > 0) {
        setSelectedVersion(list[0].versionId);
      }
    } catch (err) {
      console.error(err);
      setError('버전 목록 불러오기 실패');
    }
  }, [finalContentId]);

  // 초기 미리보기 + 버전 불러오기
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
        await fetchVersions();
      } catch (err) {
        console.error(err);
        setError('3D 모델 미리보기 불러오기 실패');
      }
    })();
  }, [finalContentId, fetchVersions]);

  // 모델 생성
  const handleGenerateClick = async () => {
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID를 입력하세요.');
    if (!style) return setMessage('❌ 스타일을 선택하세요.');
    setIsLoading(true);
    setError('');
    setMessage('');

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
      setMessage('✅ 3D 모델 생성 성공!');
    } catch (err) {
      console.error(err);
      setMessage('❌ 3D 모델 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 버전 저장
  const handleSaveVersion = async () => {
    if (!versionNote.trim()) return setMessage('❌ 버전 노트를 입력하세요.');
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    setIsLoading(true);
    setMessage('');

    try {
      await saveContentVersion({ contentId: finalContentId, note: versionNote });
      setVersionNote('3D 모델 스냅샷');
      await fetchVersions();
      setMessage('✅ 버전 저장 성공!');
    } catch (err) {
      console.error(err);
      setMessage('❌ 버전 저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 롤백
  const handleRollbackVersion = async () => {
    if (!selectedVersion) return setMessage('❌ 롤백할 버전을 선택하세요.');
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    setIsLoading(true);
    setMessage('');

    try {
      await rollbackContentVersion(finalContentId, selectedVersion);
      localStorage.removeItem(`model3d_${finalContentId}`);
      const detail = await getContentDetail(finalContentId);
      if (detail && detail.contentData) {
        setGeneratedModel(normalizeModelKeys(detail));
      }
      await fetchVersions();
      setMessage(`✅ 롤백 완료! (버전 ID: ${selectedVersion})`);
    } catch (err) {
      console.error(err);
      setMessage('❌ 롤백 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 완료 처리
  const handleComplete = async () => {
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    setIsLoading(true);
    setMessage('');

    try {
      await completeContent(finalContentId);
      setMessage('✅ 완료 처리되었습니다. 이제 제출할 수 있어요.');
    } catch (err) {
      console.error(err);
      setMessage('❌ 완료 처리 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 제출
  const handleSubmitVersion = async () => {
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');
    setIsLoading(true);
    setMessage('');

    try {
      await submitComponent(componentId);
      setMessage('🎉 제출 완료! 퍼블리셔 검토(PENDING_REVIEW)로 이동했습니다.');
    } catch (err) {
      console.error(err);
      setMessage('❌ 제출 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 초기화
  const handleReset = () => {
    setGeneratedModel(null);
    setError('');
    setMessage('');
    if (finalContentId) localStorage.removeItem(`model3d_${finalContentId}`);
  };

  return (
    <div className="component-placeholder">
      {isLoading && (
        <div className="status-container">
          <div className="loader"></div>
          <h3>처리 중...</h3>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {message && <p className="upload-message">{message}</p>}

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

          {/* 입력 폼 */}
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

                {/* 버전 저장 */}
                <div className="version-note-form">
                  <label>버전 노트</label>
                  <input
                    type="text"
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="예: 3D 모델 스냅샷"
                  />
                  <button onClick={handleSaveVersion} className="reset-button-bottom">
                    버전 저장
                  </button>
                </div>

                <button onClick={handleReset} className="reset-button-bottom">
                  다시 생성
                </button>
              </div>
            </div>
          )}

          {/* 버전 선택 + 완료/제출 */}
          {versions.length > 0 && (
            <div className="version-select-form">
              <label>버전 선택</label>
              <select value={selectedVersion || ''} onChange={(e) => setSelectedVersion(Number(e.target.value))}>
                {versions.map((v) => (
                  <option key={v.versionId} value={v.versionId}>
                    v{v.versionNo} - {v.note} ({v.createdAt})
                  </option>
                ))}
              </select>

              <div className="version-buttons">
                <button onClick={handleRollbackVersion} className="reset-button-bottom">
                  선택 버전 롤백
                </button>
                <button onClick={handleComplete} className="generate-button">
                  완료(확정)
                </button>
                <button onClick={handleSubmitVersion} className="generate-button">
                  제출
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
