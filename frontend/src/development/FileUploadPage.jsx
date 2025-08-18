import React, { useState } from 'react';
import { uploadContentFile, saveContentVersion, submitComponent } from '../api/development';
import './FileUploadPage.css';

function FileUploadPage({ contentId, componentId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [versionNote, setVersionNote] = useState('파일 업로드 스냅샷'); // 기본값 자동 입력
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false); // 업로드 완료 여부

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!contentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');
    if (!selectedFile) return setMessage('❌ 업로드할 파일을 선택하세요.');

    setIsUploading(true);
    setMessage('');

    try {
      // 1) 파일 업로드
      await uploadContentFile(contentId, selectedFile, 'manual');
      setMessage('✅ 파일 업로드 성공! 버전 노트를 확인하세요.');
      setUploadDone(true);
    } catch (err) {
      console.error(err);
      setMessage('❌ 파일 업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAndSubmit = async () => {
    if (!versionNote.trim()) return setMessage('❌ 버전 노트를 입력하세요.');

    setIsUploading(true);
    setMessage('버전 저장 중...');

    try {
      // 2) 버전 저장
      await saveContentVersion({ contentId, note: versionNote });
      setMessage('✅ 버전 저장 성공! 제출 중...');

      // 3) 제출
      await submitComponent(componentId);
      setMessage('🎉 완료! (파일 업로드 + 버전 저장 + 제출)');
      setUploadDone(false);
      setVersionNote('파일 업로드 스냅샷'); // ✅ 초기화 시에도 기본값 유지
    } catch (err) {
      console.error(err);
      setMessage('❌ 버전 저장/제출 실패');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="component-placeholder">
      <h2>[개발] 파일 업로드</h2>
      <p>지원하지 않는 콘텐츠 타입은 직접 제작한 파일을 업로드하세요.</p>

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

        <button className="upload-button" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? '업로드 중...' : '파일 업로드'}
        </button>
      </div>

      {uploadDone && (
        <div className="version-note-form">
          <label>버전 노트</label>
          <input
            type="text"
            value={versionNote}
            onChange={(e) => setVersionNote(e.target.value)}
            placeholder="예: 파일 업로드 스냅샷"
          />
          <button className="upload-button" onClick={handleSaveAndSubmit} disabled={isUploading}>
            {isUploading ? '저장/제출 중...' : '버전 저장 및 제출'}
          </button>
        </div>
      )}

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default FileUploadPage;