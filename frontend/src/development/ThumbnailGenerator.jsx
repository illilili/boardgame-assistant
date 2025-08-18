import React, { useState, useEffect } from 'react';
import './ThumbnailGenerator.css';
import {
  getThumbnailPreview,
  generateThumbnail,
  saveContentVersion,
  getContentVersions,
  submitComponent,
  rollbackContentVersion,
  getContentDetail, // ✅ 추가
} from '../api/development';

function ThumbnailGenerator({ contentId, componentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState(null);
  const [error, setError] = useState('');

  const [manualId, setManualId] = useState(contentId || '');
  const [theme, setTheme] = useState('');
  const [storyline, setStoryline] = useState('');

  const isFromList = Boolean(contentId);
  const finalContentId = isFromList ? contentId : manualId;

  // 버전 관리
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionNote, setVersionNote] = useState('썸네일 스냅샷');

  // 초기 로드
  useEffect(() => {
    if (!finalContentId) return;
    (async () => {
      try {
        await loadPreview(finalContentId);
        await fetchVersions();
      } catch (err) {
        console.error(err);
        setError('썸네일 미리보기 불러오기 실패');
      }
    })();
  }, [finalContentId]);

  // 썸네일 미리보기 로드
  const loadPreview = async (cid) => {
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
        } else {
          setGeneratedThumbnail(null);
        }
      }
      const saved = localStorage.getItem(`thumbnail_${cid}`);
      if (saved) setGeneratedThumbnail(JSON.parse(saved));
    } catch (err) {
      console.error(err);
      setError('미리보기 불러오기 실패');
    }
  };

  // 버전 목록
  const fetchVersions = async () => {
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
  };

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

  // 버전 저장
  const handleSaveVersion = async () => {
    if (!versionNote.trim()) return setError('버전 노트를 입력하세요.');
    if (!finalContentId) return setError('콘텐츠 ID가 없습니다.');

    setIsLoading(true);
    setError('');

    try {
      await saveContentVersion({ contentId: finalContentId, note: versionNote });
      setVersionNote('썸네일 스냅샷');
      await fetchVersions();
    } catch (err) {
      console.error(err);
      setError('버전 저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 버전 선택
  const handleVersionChange = (e) => {
    const versionId = Number(e.target.value);
    setSelectedVersion(versionId);
  };

  // 제출
  const handleSubmitVersion = async () => {
    if (!selectedVersion) return setError('제출할 버전을 선택하세요.');
    if (!componentId) return setError('컴포넌트 ID가 없습니다.');

    setIsLoading(true);
    setError('');

    try {
      await submitComponent(componentId);
      alert(`🎉 제출 완료! (버전 ID: ${selectedVersion})`);
    } catch (err) {
      console.error(err);
      setError('제출 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 롤백
  const handleRollbackVersion = async () => {
    if (!selectedVersion) return setError('롤백할 버전을 선택하세요.');
    if (!finalContentId) return setError('콘텐츠 ID가 없습니다.');

    setIsLoading(true);
    setError('');

    try {
      await rollbackContentVersion(finalContentId, selectedVersion);
      alert(`🔄 롤백 완료! (버전 ID: ${selectedVersion})`);

      // 캐시 제거
      localStorage.removeItem(`thumbnail_${finalContentId}`);

      // ✅ 롤백된 최신 DB 값 직접 가져오기
      const detail = await getContentDetail(finalContentId);
      if (detail && detail.contentData) {
        setGeneratedThumbnail({
          contentId: finalContentId,
          thumbnailUrl: detail.contentData,
        });
      }

      await fetchVersions();
    } catch (err) {
      console.error(err);
      setError('롤백 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 리셋
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
          <h3>처리 중...</h3>
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

              <button onClick={handleReset} className="reset-button-bottom">
                다시 생성
              </button>
            </div>
          )}

          {/* 버전 목록 */}
          {versions.length > 0 && (
            <div className="version-select-form">
              <label>버전 선택</label>
              <select value={selectedVersion || ''} onChange={handleVersionChange}>
                {versions.map((v) => (
                  <option key={v.versionId} value={v.versionId}>
                    v{v.versionNo} - {v.note} ({v.createdAt})
                  </option>
                ))}
              </select>
              <div className="version-buttons">
                <button onClick={handleSubmitVersion} className="generate-button">
                  선택 버전 제출
                </button>
                <button onClick={handleRollbackVersion} className="reset-button-bottom">
                  선택 버전 롤백
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
