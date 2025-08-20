import React, { useState, useEffect, useCallback } from 'react';
import './ThumbnailGenerator.css';
import './ComponentGenerator.css';
import './ModelGenerator.css';
import Select from 'react-select';
import {
  getThumbnailPreview,
  generateThumbnail,
  saveContentVersion,
  getContentVersions,
  submitComponent,
  rollbackContentVersion,
  getContentDetail,
  completeContent,
} from '../api/development';

function ThumbnailGenerator({ contentId, componentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [manualId, setManualId] = useState(contentId || '');
  const [theme, setTheme] = useState('');
  const [storyline, setStoryline] = useState('');

  const isFromList = Boolean(contentId);
  const finalContentId = isFromList ? contentId : manualId;

  // 버전 관리
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionNote, setVersionNote] = useState('썸네일 스냅샷');

  const fetchVersions = useCallback(async () => {
    if (!finalContentId) return;
    try {
      const list = await getContentVersions(finalContentId);
      setVersions(list);
      if (list.length > 0) setSelectedVersion(list[0].versionId);
    } catch (err) {
      console.error(err);
      setError('버전 목록 불러오기 실패');
    }
  }, [finalContentId]);

  const loadPreview = useCallback(async (cid) => {
    try {
      const preview = await getThumbnailPreview(cid);
      if (preview) {
        setTheme(preview.theme || '');
        setStoryline(preview.storyline || '');
        if (preview.thumbnailUrl) {
          setGeneratedThumbnail({
            contentId: cid,
            thumbnailUrl: preview.thumbnailUrl,
          });
        }
      }
      const saved = localStorage.getItem(`thumbnail_${cid}`);
      if (saved) setGeneratedThumbnail(JSON.parse(saved));
    } catch (err) {
      console.error(err);
      setError('미리보기 불러오기 실패');
    }
  }, []);

  useEffect(() => {
    if (!finalContentId) return;
    (async () => {
      try {
        if (isFromList) {
          const detail = await getContentDetail(finalContentId);
          if (detail && detail.contentData) {
            setGeneratedThumbnail({
              contentId: finalContentId,
              thumbnailUrl: detail.contentData,
            });
          }
        }
        await loadPreview(finalContentId);
        await fetchVersions();
      } catch (err) {
        console.error(err);
        setError('썸네일 미리보기 불러오기 실패');
      }
    })();
  }, [finalContentId, isFromList, loadPreview, fetchVersions]);

  // ---------------- 함수들 ----------------
  const handleGenerateClick = async () => {
    if (!finalContentId) return setError('콘텐츠 ID를 입력하세요.');
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await generateThumbnail({
        contentId: finalContentId,
        theme,
        storyline,
      });
      setGeneratedThumbnail(response);
      localStorage.setItem(`thumbnail_${finalContentId}`, JSON.stringify(response));
      setMessage('✅ 썸네일 생성 성공!');
    } catch (err) {
      console.error(err);
      setMessage('❌ 썸네일 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!generatedThumbnail) return;
    try {
      setIsLoading(true);

      await saveContentVersion({
        contentId: finalContentId,
        note: versionNote || '썸네일 스냅샷',
        contentData: generatedThumbnail.thumbnailUrl,
      });

      setMessage('✅ 버전이 저장되었습니다.');
      const updated = await getContentVersions(finalContentId);
      setVersions(updated);
    } catch (err) {
      setError(err.response?.data?.message || '버전 저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackVersion = async () => {
    if (!selectedVersion) return setMessage('❌ 롤백할 버전을 선택하세요.');
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await rollbackContentVersion(finalContentId, selectedVersion.value);
      localStorage.removeItem(`thumbnail_${finalContentId}`);
      const detail = await getContentDetail(finalContentId);
      if (detail && detail.contentData) {
        setGeneratedThumbnail({
          contentId: finalContentId,
          thumbnailUrl: detail.contentData,
        });
      }
      await fetchVersions();
      setMessage(`✅ 롤백 완료! (버전 ID: ${selectedVersion.value})`);
    } catch (err) {
      console.error(err);
      setMessage('❌ 롤백 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    setIsLoading(true);
    setError('');
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

  const handleSubmitVersion = async () => {
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');
    setIsLoading(true);
    setError('');
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

  const handleReset = () => {
    setGeneratedThumbnail(null);
    setError('');
    setMessage('');
    if (finalContentId) localStorage.removeItem(`thumbnail_${finalContentId}`);
  };

  // ---------------- JSX ----------------
  return (
    <div className="generator-layout">
      {/* 왼쪽 */}
      <div className="generator-form-section">
        <div className="form-section-header">
          <h2>썸네일 생성</h2>
          <p>테마와 스토리라인을 입력하고 썸네일 이미지를 생성/관리합니다.</p>
        </div>

        {!isFromList && (
          <div className="form-group">
            <label>콘텐츠 ID</label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="콘텐츠 ID 입력"
            />
          </div>
        )}

        <div className="concept-info thumbnail-concept">
          <h3>기본 컨셉 정보</h3>
          <div className="form-group">
            <label>테마</label>
            <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div className="form-group">
            <label>스토리라인</label>
            <textarea rows={3} value={storyline} onChange={(e) => setStoryline(e.target.value)} />
          </div>
        </div>

        {!generatedThumbnail && (
          <div className="initial-generate-buttons">
            <button onClick={handleGenerateClick} className="generate-button text-btn">
              썸네일 생성하기
            </button>
          </div>
        )}

        {/* 버전 관리 */}
        {generatedThumbnail && (
          <div className="model-version-manager">
            <h4>버전 관리</h4>
            <div className="model-version-note">
              <label>버전 메모:</label>
              <input
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="썸네일 스냅샷"
              />
              <button className="save" onClick={handleSaveVersion}>버전 저장</button>
            </div>

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
                    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
                      date.getHours()
                    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

                    return {
                      value: v.versionId,
                      label: `v${v.versionNo} - ${v.note} (${formattedDate})`,
                    };
                  })}
                  placeholder="버전 선택"
                />
              ) : (
                <Select className="version-select" classNamePrefix="react-select" isDisabled placeholder="저장된 버전 없음" />
              )}
              {selectedVersion && (
                <button className="rollback" onClick={handleRollbackVersion} disabled={isLoading}>
                  롤백
                </button>
              )}
            </div>

            <div className="submit-complete-section">
              <button onClick={handleComplete}>완료(확정)</button>
              <button onClick={handleSubmitVersion}>제출</button>
            </div>
          </div>
        )}

        {message && <p className="upload-message">{message}</p>}
      </div>

      {/* 오른쪽 */}
      <div className="generator-result-section">
        {isLoading ? (
          <div className="status-container"><div className="loader"></div><h3>처리 중...</h3></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : generatedThumbnail ? (
          <div className="card-result-container">
            <img src={generatedThumbnail.thumbnailUrl} alt="thumbnail" className="thumbnail-image" />
            <div className="result-actions">
              <button onClick={handleReset} className="reset-button-bottom">다시 생성</button>
            </div>
          </div>
        ) : (
          <div className="placeholder-message">
            <p>테마와 스토리라인을 입력하고 '썸네일 생성하기' 버튼을 눌러주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThumbnailGenerator;
