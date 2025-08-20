import React, { useState, useEffect, useCallback } from 'react';
import './ComponentGenerator.css';   // 카드랑 동일한 레이아웃 CSS 사용
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
import Select from "react-select";

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
      if (list.length > 0) setSelectedVersion(list[0].versionId);
    } catch {
      setError('버전 목록 불러오기 실패');
    }
  }, [finalContentId]);

  const refreshGlbFromDetail = useCallback(async () => {
    if (!finalContentId) return;
    try {
      const detail = await getContentDetail(finalContentId);
      if (detail?.contentData?.endsWith('.glb')) {
        setGlbUrl(detail.contentData);
      } else {
        setGlbUrl('');
      }
    } catch {
      setError('3D 모델 상세 불러오기 실패');
    }
  }, [finalContentId]);

  const styleOptions = [
    { value: "realistic", label: "Realistic(사실적)" },
    { value: "sculpture", label: "Sculpture(조형적)" },
  ];

  useEffect(() => {
    if (!finalContentId) return;
    (async () => {
      try {
        const preview = await getModel3DPreview(finalContentId).catch(() => null);
        if (preview) {
          setName(preview.name || '');
          setDescription(preview.description || '');
          // setComponentInfo(preview.artConcept || '');
          setTheme(preview.theme || '');
          setStoryline(preview.storyline || '');
        }
        await refreshGlbFromDetail();
        await fetchVersions();
      } catch {
        setError('초기 데이터 불러오기 실패');
      }
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
    <div className="generator-layout">
      {/* ------------------- 왼쪽: 입력 및 버전관리 ------------------- */}
      <div className="generator-form-section">
        <div className="form-section-header">
          <h2>3D 모델 생성</h2>
          <p>모델 정보를 입력하고 GLB 파일을 생성/관리합니다.</p>
        </div>

        {/* 입력 폼 */}
        <div className="card-gen-form">
          {!isFromList && (
            <div className="form-group">
              <label>콘텐츠 ID</label>
              <input value={manualId} onChange={(e) => setManualId(e.target.value)} />
            </div>
          )}
          {/* 기본 컨셉 정보 */}
          <div className="concept-info">
            <h3>기본 컨셉 정보</h3>
            <p><strong>테마:</strong> {theme}</p>
            <p><strong>스토리라인:</strong> {storyline}</p>
          </div>

          <div className="form-group">
            <label>아이템 이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>설명</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label>아트 컨셉 (옵션)</label>
            <input
              value={componentInfo}
              onChange={(e) => setComponentInfo(e.target.value)}
              placeholder="추가 아트 컨셉 입력"
            />
          </div>

          <div className="form-group">
            <label>스타일</label>
            <Select
              value={styleOptions.find(opt => opt.value === style)}
              onChange={(selected) => setStyle(selected.value)}
              options={styleOptions}
              placeholder="스타일 선택"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "8px",
                  padding: "2px",
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#E58A4E" },
                }),
              }}
            />
          </div>
        </div>

        {/* 생성 버튼 */}
        {!glbUrl && (
          <div className="initial-generate-buttons">
            <button onClick={handleGenerateClick} className="generate-button text-btn">
              3D 모델 생성하기
            </button>
          </div>
        )}

        {/* 버전관리 */}
        {glbUrl && (
          <div className="model-version-manager">
            <h4>버전 관리</h4>

            {/* 버전 메모 + 저장 버튼 */}
            <div className="model-version-note">
              <label>버전 메모:</label>
              <input
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="모델 스냅샷"
              />
              <button className="save" onClick={handleSaveVersion}>
                버전 저장
              </button>
            </div>

            {/* 버전 선택바 + 롤백 버튼 */}
            <div className="model-version-select-row">
              {versions.length > 0 ? (
                <Select
                  className="version-select"
                  classNamePrefix="react-select"
                  value={selectedVersion}
                  onChange={(selected) => setSelectedVersion(selected)}
                  options={versions.map((v) => {
                    const date = new Date(v.createdAt);
                    const formattedDate = `${date.getFullYear()}-${String(
                      date.getMonth() + 1
                    ).padStart(2, "0")}-${String(date.getDate()).padStart(
                      2,
                      "0"
                    )} ${String(date.getHours()).padStart(2, "0")}:${String(
                      date.getMinutes()
                    ).padStart(2, "0")}`;

                    return {
                      value: v.versionId,
                      label: `v${v.versionNo} - ${v.note} (${formattedDate})`,
                    };
                  })}
                  placeholder="버전 선택"
                />
              ) : (
                <Select
                  className="version-select"
                  classNamePrefix="react-select"
                  isDisabled
                  placeholder="저장된 버전 없음"
                />
              )}

              {selectedVersion && (
                <button
                  className="rollback"
                  onClick={handleRollbackVersion}
                  disabled={isLoading}
                >
                  롤백
                </button>
              )}
            </div>

            {/* 완료/제출 버튼 */}
            <div className="submit-complete-section">
              <button onClick={handleComplete}>완료(확정)</button>
              <button onClick={handleSubmit}>제출</button>
            </div>

            {message && <p className="upload-message">{message}</p>}
          </div>
        )}
      </div>

      {/* ------------------- 오른쪽: 결과 뷰어 ------------------- */}
      <div className="generator-result-section">
        {isLoading ? (
          <div className="status-container"><div className="loader"></div><h3>처리 중...</h3></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : glbUrl ? (
          <div className="card-result-container">
            <model-viewer src={glbUrl} alt={name || '3D Model'} auto-rotate camera-controls style={{ width: '100%', height: '500px' }}></model-viewer>
            <div className="result-actions">
              <a
                href={glbUrl}
                target="_blank"
                rel="noreferrer"
                className="glb-download-button"
              >
                GLB 다운로드
              </a>
              <button onClick={() => setGlbUrl('')} className="reset-button-bottom">다시 생성</button>
            </div>
          </div>
        ) : (
          <div className="placeholder-message"><p>아이템 정보를 입력하고 '3D 모델 생성하기' 버튼을 눌러주세요.</p></div>
        )}
      </div>
    </div>
  );
}

export default ModelGenerator;
