import React, { useState, useEffect, useCallback } from 'react';
import './ThumbnailGenerator.css';
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
  const [message, setMessage] = useState(''); // ✅ 메시지 상태 추가

  const [manualId, setManualId] = useState(contentId || '');
  const [theme, setTheme] = useState('');
  const [storyline, setStoryline] = useState('');

  const isFromList = Boolean(contentId);
  const finalContentId = isFromList ? contentId : manualId;

  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionNote, setVersionNote] = useState('썸네일 스냅샷');

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
    if (!versionNote.trim()) return setMessage('❌ 버전 노트를 입력하세요.');
    if (!finalContentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await saveContentVersion({ contentId: finalContentId, note: versionNote });
      setVersionNote('썸네일 스냅샷');
      await fetchVersions();
      setMessage('✅ 버전 저장 성공!');
    } catch (err) {
      console.error(err);
      setMessage('❌ 버전 저장 실패');
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
      await rollbackContentVersion(finalContentId, selectedVersion);
      localStorage.removeItem(`thumbnail_${finalContentId}`);
      const detail = await getContentDetail(finalContentId);
      if (detail && detail.contentData) {
        setGeneratedThumbnail({
          contentId: finalContentId,
          thumbnailUrl: detail.contentData,
        });
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

  return (
    <div className="component-placeholder">
      {isLoading && (
        <div className="status-container">
          <div className="loader"></div>
          <h3>처리 중...</h3>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {message && <p className="upload-message">{message}</p>} {/* ✅ 메시지 출력 */}

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

          {/* 입력 */}
          <div className="form-group">
            <label>테마</label>
            <input value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div className="form-group">
            <label>스토리라인</label>
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

              {/* 버전 저장 */}
              <div className="version-note-form">
                <label>버전 노트</label>
                <input
                  type="text"
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="예: 썸네일 스냅샷"
                />
                <button onClick={handleSaveVersion} className="reset-button-bottom">
                  버전 저장
                </button>
              </div>

              {/* 편집 초기화(재생성) */}
              <button onClick={handleReset} className="reset-button-bottom">
                다시 생성
              </button>
            </div>
          )}

          {/* 버전 목록 + 롤백/완료/제출 */}
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

export default ThumbnailGenerator;
