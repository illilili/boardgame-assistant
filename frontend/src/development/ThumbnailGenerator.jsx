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
    } catch (err) {
      console.error(err);
      setError('버전 목록 불러오기 실패');
    }
  }, [finalContentId]);

  const loadPreview = useCallback(async (cid) => {
    try {
      const detail = await getContentDetail(cid);
      if (detail && detail.contentData && detail.contentData.startsWith('http')) {
        setGeneratedThumbnail({
          contentId: cid,
          thumbnailUrl: detail.contentData,
        });
      }

      const preview = await getThumbnailPreview(cid);
      if (preview) {
        setTheme(preview.theme || '');
        setStoryline(preview.storyline || '');
      }
    } catch (err) {
      console.error(err);
      setError('미리보기 불러오기 실패');
    }
  }, []);

  useEffect(() => {
    if (finalContentId) {
      loadPreview(finalContentId);
      fetchVersions();
    }
  }, [finalContentId, loadPreview, fetchVersions]);

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
      setMessage('썸네일 생성 성공!');
    } catch (err) {
      console.error(err);
      setError('썸네일 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!generatedThumbnail) return;
    setIsLoading(true);
    try {
      await saveContentVersion({
        contentId: finalContentId,
        note: versionNote || '썸네일 스냅샷',
        contentData: generatedThumbnail.thumbnailUrl,
      });
      setMessage('버전이 저장되었습니다.');
      await fetchVersions();
    } catch (err) {
      setError(err.response?.data?.message || '버전 저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackVersion = async () => {
    if (!selectedVersion) return setError('롤백할 버전을 선택하세요.');
    setIsLoading(true);
    try {
      await rollbackContentVersion(finalContentId, selectedVersion.value);
      const detail = await getContentDetail(finalContentId);
      if (detail && detail.contentData) {
        setGeneratedThumbnail({
          contentId: finalContentId,
          thumbnailUrl: detail.contentData,
        });
      }
      await fetchVersions();
      setMessage(`롤백 완료!`);
      setSelectedVersion(null);
    } catch (err) {
      console.error(err);
      setError('롤백 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!finalContentId) return;
    setIsLoading(true);
    try {
      await completeContent(finalContentId);
      setMessage('완료 처리되었습니다.');
    } catch (err) {
      console.error(err);
      setError('완료 처리 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitVersion = async () => {
    if (!componentId) return;
    setIsLoading(true);
    try {
      await submitComponent(componentId);
      setMessage('제출 완료!');
    } catch (err) {
      console.error(err);
      setError('제출 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedThumbnail(null);
    setError('');
    setMessage('');
  };

  return (
    <div className="generator-layout">
      <div className="generator-form-section">
        <div className="form-section-header">
          <h2>썸네일 생성</h2>
          <p>테마와 스토리라인을 입력하고 썸네일 이미지를 생성/관리합니다.</p>
        </div>

        {!isFromList && (
          <div className="control-box">
            <div className="form-group">
              <label>콘텐츠 ID</label>
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="콘텐츠 ID 입력"
              />
            </div>
          </div>
        )}

        <div className="control-box">
          <h4>컨셉 정보</h4>
          <div className="form-group">
            <label>테마</label>
            <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div className="form-group">
            <label>스토리라인</label>
            <textarea rows={3} value={storyline} onChange={(e) => setStoryline(e.target.value)} />
          </div>
          {!generatedThumbnail && (
            <div className="form-actions">
              <button
                onClick={handleGenerateClick}
                className="primary-button"
                disabled={isLoading}
              >
                썸네일 생성하기
              </button>
            </div>
          )}
        </div>

        <details className="control-box accordion">
          <summary>
            <h4>버전 관리</h4>
          </summary>
          <div className="accordion-content">
            <div className="model-version-note">
              <label>버전 메모:</label>
              <input
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="썸네일 스냅샷"
                disabled={!generatedThumbnail || isLoading}
              />
              <button className="save" onClick={handleSaveVersion} disabled={!generatedThumbnail || isLoading}>
                버전 저장
              </button>
            </div>
            <div className="model-version-select-row">
              <Select
                className="version-select"
                classNamePrefix="react-select"
                value={selectedVersion}
                onChange={setSelectedVersion}
                options={versions.map((v) => ({
                  value: v.versionId,
                  label: `v${v.versionNo} - ${v.note} (${new Date(v.createdAt).toLocaleString()})`,
                }))}
                placeholder={versions.length > 0 ? "버전 선택" : "저장된 버전 없음"}
                isDisabled={versions.length === 0}
                isClearable
              />
              <button className="rollback" onClick={handleRollbackVersion} disabled={!selectedVersion || isLoading}>
                롤백
              </button>
            </div>
          </div>
        </details>

        <div className="submit-complete-section">
          <button className="secondary-button" onClick={handleComplete} disabled={!generatedThumbnail || isLoading}>완료(확정)</button>
          <button className="primary-button" onClick={handleSubmitVersion} disabled={!generatedThumbnail || isLoading}>제출</button>
        </div>

        <div className="message-area">
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>

      <div className="generator-result-section">
        {isLoading ? (
          <div className="status-container"><div className="loader"></div><h3>처리 중...</h3></div>
        ) : generatedThumbnail ? (
          <div className="card-result-container">
            <img src={generatedThumbnail.thumbnailUrl} alt="thumbnail" className="thumbnail-image" />
            <div className="result-actions">
              <button onClick={handleReset} className="secondary-button">
                다시 생성
              </button>
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
