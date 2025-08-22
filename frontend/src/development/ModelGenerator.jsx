import React, { useState, useEffect, useCallback } from 'react';
import './ModelGenerator.css'; // ✨ 이 파일 하나만 사용합니다.
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
import Select from "react-select";
import { FiDownload, FiRotateCcw } from 'react-icons/fi';

function ModelGenerator({ contentId, componentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [manualId, setManualId] = useState(contentId || '');
  const isFromList = Boolean(contentId);
  const finalContentId = isFromList ? contentId : manualId;

  // 입력값
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [componentInfo, setComponentInfo] = useState('');
  const [theme, setTheme] = useState('');
  const [storyline, setStoryline] = useState('');
  const [style, setStyle] = useState('');

  // 결과 GLB
  const [glbUrl, setGlbUrl] = useState('');

  // 버전관리
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionNote, setVersionNote] = useState('3D 모델 스냅샷');

  const fetchVersions = useCallback(async () => {
    if (!finalContentId) return;
    try {
      const list = await getContentVersions(finalContentId);
      setVersions(list);
    } catch { setError('버전 목록을 불러오는데 실패했습니다.'); }
  }, [finalContentId]);

  const refreshGlbFromDetail = useCallback(async () => {
    if (!finalContentId) return;
    try {
      const detail = await getContentDetail(finalContentId);
      setGlbUrl(detail?.contentData?.endsWith('.glb') ? detail.contentData : '');
    } catch { setError('3D 모델 상세 정보를 불러오는데 실패했습니다.'); }
  }, [finalContentId]);

  const styleOptions = [
    { value: "realistic", label: "Realistic (사실적인 스타일)" },
    { value: "sculpture", label: "Sculpture (조형물 스타일)" },
  ];

  useEffect(() => {
    if (!finalContentId) return;
    (async () => {
      try {
        const preview = await getModel3DPreview(finalContentId).catch(() => null);
        if (preview) {
          setName(preview.name || '');
          setDescription(preview.description || '');
          setTheme(preview.theme || '');
          setStoryline(preview.storyline || '');
        }
        await refreshGlbFromDetail();
        await fetchVersions();
      } catch { setError('초기 데이터를 불러오는데 실패했습니다.'); }
    })();
  }, [finalContentId, fetchVersions, refreshGlbFromDetail]);

  const handleGenerateClick = async () => {
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID를 입력하세요.');
    if (!style) return setMessage('❌ 스타일을 선택하세요.');
    setIsLoading(true);
    setMessage('');
    try {
      await generate3DModel({ contentId: finalContentId, name, description, componentInfo, theme, storyline, style });
      await refreshGlbFromDetail();
      setMessage('✅ 3D 모델 생성 성공!');
    } catch {
      setMessage('❌ 3D 모델 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!versionNote.trim() || !finalContentId) return;
    setIsLoading(true);
    try {
      await saveContentVersion({ contentId: finalContentId, note: versionNote });
      setVersionNote('3D 모델 스냅샷');
      await fetchVersions();
      setMessage('✅ 버전 저장 성공!');
    } catch {
      setMessage('❌ 버전 저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackVersion = async () => {
    if (!selectedVersion || !finalContentId) return;
    setIsLoading(true);
    try {
      await rollbackContentVersion(finalContentId, selectedVersion.value);
      await refreshGlbFromDetail();
      await fetchVersions();
      setMessage('↩️ 이전 버전으로 롤백되었습니다.');
    } catch {
      setMessage('❌ 롤백 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!finalContentId) return;
    setIsLoading(true);
    try {
      await completeContent(finalContentId);
      setMessage('✅ 완료 처리되었습니다.');
    } catch {
      setMessage('❌ 완료 처리 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!componentId) return;
    setIsLoading(true);
    try {
      await submitComponent(componentId);
      setMessage('🎉 제출 완료!');
    } catch {
      setMessage('❌ 제출 실패');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="model-gen-layout">
      {/* 왼쪽: 입력 및 버전관리 */}
      <div className="model-gen-panel model-gen-panel--form">
        <header className="model-gen-header">
          <h2>3D 모델 생성</h2>
          <p>모델 정보를 입력하고 GLB 파일을 생성 및 관리합니다.</p>
        </header>

        <form className="model-gen-form">
          {!isFromList && (
            <div className="model-gen-form-group">
              <label>콘텐츠 ID</label>
              <input value={manualId} onChange={(e) => setManualId(e.target.value)} />
            </div>
          )}
          <div className="model-gen-concept-info">
            <h3>기본 컨셉 정보</h3>
            <p><strong>테마:</strong> {theme || 'N/A'}</p>
            <p><strong>스토리라인:</strong> {storyline || 'N/A'}</p>
          </div>

          <div className="model-gen-form-group">
            <label htmlFor="modelName">아이템 이름</label>
            <input id="modelName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="model-gen-form-group">
            <label htmlFor="modelDesc">설명</label>
            <textarea id="modelDesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="model-gen-form-group">
            <label htmlFor="modelArtConcept">아트 컨셉 (선택)</label>
            <input id="modelArtConcept" value={componentInfo} onChange={(e) => setComponentInfo(e.target.value)} placeholder="추가적인 아트 컨셉이나 키워드를 입력하세요" />
          </div>
          <div className="model-gen-form-group">
            <label>스타일</label>
            <Select
              value={styleOptions.find(opt => opt.value === style)}
              onChange={(selected) => setStyle(selected.value)}
              options={styleOptions}
              placeholder="생성할 모델의 스타일을 선택하세요"
              classNamePrefix="model-gen-select"
            />
          </div>
        </form>

        {!glbUrl && (
          <div className="model-gen-action-group">
            <button onClick={handleGenerateClick} className="model-gen-button model-gen-button--primary">
              3D 모델 생성하기
            </button>
          </div>
        )}

        {glbUrl && (
          <div className="model-gen-version-manager">
            <h4>버전 관리</h4>
            <div className="model-gen-version-group">
              <input
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="버전 메모 (예: 초기 모델)"
              />
              <button className="model-gen-button model-gen-button--secondary" onClick={handleSaveVersion}>
                버전 저장
              </button>
            </div>
            <div className="model-gen-version-group">
              <Select
                className="model-gen-version-select"
                classNamePrefix="model-gen-select"
                value={selectedVersion}
                onChange={(selected) => setSelectedVersion(selected)}
                options={versions.map(v => ({
                    value: v.versionId,
                    label: `v${v.versionNo} - ${v.note} (${new Date(v.createdAt).toLocaleString()})`,
                }))}
                placeholder={versions.length > 0 ? "버전 선택" : "저장된 버전 없음"}
                isDisabled={versions.length === 0}
              />
              <button className="model-gen-button model-gen-button--secondary" onClick={handleRollbackVersion} disabled={!selectedVersion}>
                롤백
              </button>
            </div>
            
            <div className="model-gen-final-actions">
              <button onClick={handleComplete} className="model-gen-button model-gen-button--secondary">완료(확정)</button>
              <button onClick={handleSubmit} className="model-gen-button model-gen-button--primary">컴포넌트 제출</button>
            </div>
          </div>
        )}
         {message && <p className="model-gen-status-message">{message}</p>}
      </div>

      {/* 오른쪽: 결과 뷰어 */}
      <div className="model-gen-panel model-gen-panel--result">
        {isLoading ? (
          <div className="model-gen-status-display"><div className="model-gen-spinner"></div><h3>처리 중...</h3></div>
        ) : error ? (
          <div className="model-gen-status-display model-gen-status-display--error">{error}</div>
        ) : glbUrl ? (
          <div className="model-gen-viewer-container">
            <model-viewer src={glbUrl} alt={name || '3D Model'} auto-rotate camera-controls></model-viewer>
            <div className="model-gen-viewer-actions">
              <a href={glbUrl} target="_blank" rel="noreferrer" className="model-gen-button model-gen-button--primary">
                <FiDownload /> GLB 다운로드
              </a>
              <button onClick={() => setGlbUrl('')} className="model-gen-button model-gen-button--secondary">
                <FiRotateCcw /> 다시 생성
              </button>
            </div>
          </div>
        ) : (
          <div className="model-gen-status-display">정보를 입력하고 모델 생성을 시작해주세요.</div>
        )}
      </div>
    </div>
  );
}

export default ModelGenerator;