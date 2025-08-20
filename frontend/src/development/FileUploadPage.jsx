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
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!contentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');
    if (!selectedFile) return setMessage('❌ 업로드할 파일을 선택하세요.');

    setIsLoading(true);
    setMessage('');

    try {
      await uploadContentFile(contentId, selectedFile, 'manual');
      await completeContent(contentId);
      setMessage('✅ 파일 업로드 및 완료 처리 성공!');
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
      setMessage('❌ 파일 업로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="file-upload-container">
      <h2 className="file-upload-title">파일 업로드</h2>
      <p className="file-upload-desc">
        지원하지 않는 컴포넌트 타입은 직접 파일을 업로드 해주세요.
      </p>

      <div className="file-upload-row">
        <div className="file-upload-left">
          <div className="file-upload-group">
            <label>콘텐츠 ID</label>
            <input type="text" value={contentId || ''} disabled />
          </div>
          <div className="file-upload-group">
            <label>컴포넌트 ID</label>
            <input type="text" value={componentId || ''} disabled />
          </div>
          <div className="file-upload-group">
            <label>파일 선택</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                className="file-upload-input"
              />
              <label htmlFor="fileInput" className="file-upload-label">
                {selectedFile ? selectedFile.name : '파일 선택'}
              </label>
            </div>
          </div>
        </div>

        <div className="file-upload-right">
          <button
            className="file-upload-button"
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? '업로드 중...' : '파일 업로드'}
          </button>

          {uploadSuccess && (
            <button
              className="file-submit-button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? '제출 중...' : '제출'}
            </button>
          )}
        </div>
      </div>

      {message && <p className="file-upload-message">{message}</p>}
    </div>
  );
}

export default FileUploadPage;
