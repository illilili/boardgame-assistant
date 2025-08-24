import React, { useState, useEffect } from 'react';

const SubmissionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  successMessage,
  error,
}) => {
  const [submissionFile, setSubmissionFile] = useState(null);
  const [formKey, setFormKey] = useState(Date.now()); // 파일 입력 초기화를 위한 key

  useEffect(() => {
    // 모달이 열릴 때 상태 초기화
    if (isOpen) {
      setSubmissionFile(null);
      setFormKey(Date.now());
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSubmissionFile(e.target.files[0]);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    // onSubmit이 성공적으로 끝나면 파일 상태를 초기화하도록 부모에게 위임
    await onSubmit(submissionFile, () => {
        setSubmissionFile(null);
        setFormKey(Date.now());
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>기획안 최종 제출</h2>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="error-message">{error}</p>}
          
          <form key={formKey} className="save-version-form" onSubmit={handleSubmitForm}>
            <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '-10px', marginBottom: '20px' }}>
                작업이 완료된 기획안 파일을 제출해주세요.
            </p>
            <div className="form-group">
              <label htmlFor="submissionFile">제출할 기획서 파일 (PDF)</label>
              <input
                type="file"
                id="submissionFile"
                accept="application/pdf"
                onChange={handleFileChange}
                required
              />
            </div>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting || !submissionFile}
            >
              {isSubmitting ? "제출 중..." : "최종 제출하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;