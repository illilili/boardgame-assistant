import React, { useState, useEffect } from 'react';
import {
  uploadContentFile,
  completeContent,
  submitComponent,
  getGenericPreview, // ✅ 새 API 클라이언트 함수
} from '../api/development';
import './FileUploadPage.css';

function FileUploadPage({ contentId, componentId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [previewInfo, setPreviewInfo] = useState(null); // ✅ GenericPreview 저장

  // 미리보기 정보 불러오기
  useEffect(() => {
    if (!contentId) return;
    const fetchPreview = async () => {
      try {
        const data = await getGenericPreview(contentId);
        setPreviewInfo(data);
      } catch (err) {
        console.error('❌ 미리보기 불러오기 실패:', err);
      }
    };
    fetchPreview();
  }, [contentId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!contentId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
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

      {/* ✅ Generic Preview 표시 */}
      {previewInfo && (
        <div className="preview-info-box">
          <div className="preview-header">
            <h3 className="preview-title">{previewInfo.title}</h3>
            <small className="content-id-display">콘텐츠 ID: {previewInfo.contentId}</small>
          </div>
          <div className="preview-body">
            <p><strong>역할/효과:</strong> {previewInfo.roleAndEffect}</p>
            <p><strong>아트 컨셉:</strong> {previewInfo.artConcept}</p>
            <p><strong>상호작용:</strong> {previewInfo.interconnection}</p>
          </div>
        </div>
      )}

      {/* 파일 선택 + 버튼 묶음 */}
      <div className="file-upload-group">
        <div className="file-input-row">
          {/* 커스텀 파일 입력 박스 */}
          <div className="file-input-box">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="file-upload-input"
            />
            <label htmlFor="fileInput" className="file-select-btn">
              파일 선택
            </label>
            <span className="file-name">
              {selectedFile ? selectedFile.name : '파일을 선택해 주세요'}
            </span>
          </div>

          {/* 업로드/제출 버튼 그룹 */}
          <div className="file-button-group">
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
      </div>

      {message && <p className="file-upload-message">{message}</p>}
    </div>
  );
}

export default FileUploadPage;
