// src/development/FileUploadPage.jsx
import React, { useState } from 'react';
import {
  uploadContentFile,
  completeContent,
  submitComponent,
} from '../api/development';
import './FileUploadPage.css';

function FileUploadPage({ contentId, componentId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // 업로드 → 완료 처리
  const handleUpload = async () => {
    if (!contentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');
    if (!selectedFile) return setMessage('❌ 업로드할 파일을 선택하세요.');

    setIsLoading(true);
    setMessage('');

    try {
      await uploadContentFile(contentId, selectedFile, 'manual');
      await completeContent(contentId); // ✅ 업로드 후 자동 완료 처리
      setMessage('✅ 파일 업로드 및 완료 처리 성공!');
    } catch (err) {
      console.error(err);
      setMessage('❌ 파일 업로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 제출
  const handleSubmit = async () => {
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');

    setIsLoading(true);
    setMessage('');

    try {
      await submitComponent(componentId);
      setMessage(`🎉 제출 완료! (컴포넌트 ID: ${componentId})`);
    } catch (err) {
      console.error(err);
      setMessage('❌ 제출 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="component-placeholder">
      <h2>[개발] 파일 업로드</h2>

      {/* 업로드 */}
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
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={isLoading}
        >
          {isLoading ? '업로드 중...' : '파일 업로드'}
        </button>
      </div>

      {/* 제출 */}
      <div className="submit-form">
        <button
          className="upload-button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? '제출 중...' : '제출'}
        </button>
      </div>

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default FileUploadPage;
