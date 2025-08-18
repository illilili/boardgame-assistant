// src/development/FileUploadPage.jsx
import React, { useState, useEffect } from 'react';
import {
  uploadContentFile,
  saveContentVersion,
  submitComponent,
  getContentVersions // ✅ 새로 추가
} from '../api/development';
import './FileUploadPage.css';

function FileUploadPage({ contentId, componentId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [versionNote, setVersionNote] = useState('파일 업로드 스냅샷');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 버전 관리
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // 버전 목록 불러오기
  useEffect(() => {
    if (contentId) {
      fetchVersions();
    }
  }, [contentId]);

  const fetchVersions = async () => {
    try {
      const versions = await getContentVersions(contentId);
      setVersions(versions);
      if (versions.length > 0) {
        setSelectedVersion(versions[0].versionId); // 최신 버전 기본 선택
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ 버전 목록 불러오기 실패');
    }
  };
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!contentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');
    if (!selectedFile) return setMessage('❌ 업로드할 파일을 선택하세요.');

    setIsLoading(true);
    setMessage('');

    try {
      await uploadContentFile(contentId, selectedFile, 'manual');
      setMessage('✅ 파일 업로드 성공! 버전 노트를 입력 후 저장하세요.');
    } catch (err) {
      console.error(err);
      setMessage('❌ 파일 업로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!versionNote.trim()) return setMessage('❌ 버전 노트를 입력하세요.');

    setIsLoading(true);
    setMessage('버전 저장 중...');

    try {
      await saveContentVersion({ contentId, note: versionNote });
      setMessage('✅ 버전 저장 성공!');
      setVersionNote('파일 업로드 스냅샷');
      fetchVersions(); // 저장 후 버전 목록 새로고침
    } catch (err) {
      console.error(err);
      setMessage('❌ 버전 저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitVersion = async () => {
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');

    setIsLoading(true);
    setMessage('제출 중...');

    try {
      await submitComponent(componentId);
      setMessage(`🎉 제출 완료! (컴포넌트 ID: ${componentId}, 버전 ID: ${selectedVersion})`);
    } catch (err) {
      console.error(err);
      setMessage('❌ 제출 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="component-placeholder">
      <h2>[개발] 파일 업로드 & 버전 관리</h2>

      <div className="upload-form">
        <div className="form-group">
          <label>콘텐츠 ID</label>
          <input type="text" value={contentId || ''} disabled />
        </div>

        <div className="form-group">
          <label>컴포넌트 ID</label>
          <input type="text" value={componentId || ''} disabled />
        </div>

        <div className="form-group">
          <label>파일 선택</label>
          <input type="file" onChange={handleFileChange} />
        </div>

        <button className="upload-button" onClick={handleUpload} disabled={isLoading}>
          {isLoading ? '업로드 중...' : '파일 업로드'}
        </button>
      </div>

      <div className="version-note-form">
        <label>버전 노트</label>
        <input
          type="text"
          value={versionNote}
          onChange={(e) => setVersionNote(e.target.value)}
          placeholder="예: 파일 업로드 스냅샷"
        />
        <button className="upload-button" onClick={handleSaveVersion} disabled={isLoading}>
          {isLoading ? '저장 중...' : '버전 저장'}
        </button>
      </div>

      {versions.length > 0 && (
        <div className="version-select-form">
          <label>제출할 버전 선택</label>
          <select
            value={selectedVersion || ''}
            onChange={(e) => setSelectedVersion(e.target.value)}
          >
            {versions.map((v) => (
              <option key={v.versionId} value={v.versionId}>
                v{v.versionNumber} - {v.note} ({v.createdAt})
              </option>
            ))}
          </select>
          <button className="upload-button" onClick={handleSubmitVersion} disabled={isLoading}>
            {isLoading ? '제출 중...' : '선택 버전 제출'}
          </button>
        </div>
      )}

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default FileUploadPage;
