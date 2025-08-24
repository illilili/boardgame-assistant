import React, { useState, useEffect } from 'react';

const VersionHistoryModal = ({
  isOpen,
  onClose,
  versions,
  planContent,
  onSaveVersion,
  onRollback,
  isSaving,
  successMessage,
  error,
}) => {
  const [versionName, setVersionName] = useState('');
  const [versionMemo, setVersionMemo] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');

  useEffect(() => {
    // 모달이 열릴 때 상태 초기화
    if (isOpen) {
      setVersionName('');
      setVersionMemo('');
      setSelectedVersionId('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    onSaveVersion({ versionName, versionMemo });
  };

  const handleRollbackSelect = (e) => {
    const versionId = e.target.value;
    if (!versionId) return;

    const selectedVersion = versions.find(v => v.versionId.toString() === versionId);
    if (selectedVersion) {
      setSelectedVersionId(versionId);
      // 부모 컴포넌트의 onRollback 함수 호출
      onRollback(selectedVersion.versionId, selectedVersion.versionName);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>버전 관리</h2>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="error-message">{error}</p>}
          
          {/* 버전 저장 */}
          <form className="save-version-form" onSubmit={handleSaveSubmit}>
            <div className="form-group">
              <label htmlFor="modalVersionName">버전 이름</label>
              <input
                type="text"
                id="modalVersionName"
                value={versionName}
                onChange={e => setVersionName(e.target.value)}
                placeholder="예: v1.1 - 밸런스 수정"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="modalVersionMemo">메모 (선택)</label>
              <input
                type="text"
                id="modalVersionMemo"
                value={versionMemo}
                onChange={e => setVersionMemo(e.target.value)}
                placeholder="수정 내용 요약"
              />
            </div>
            <button type="submit" className="primary-button" disabled={isSaving || !planContent}>
              {isSaving ? "저장 중..." : "현재 내용 버전으로 저장"}
            </button>
          </form>

          {/* 롤백 */}
          {versions && versions.length > 0 && (
            <div className="form-group" style={{ marginTop: "24px", borderTop: '1px solid #eaeaea', paddingTop: '24px' }}>
              <label htmlFor="version-select">저장된 버전 불러오기 (롤백)</label>
              <select
                id="version-select"
                value={selectedVersionId}
                onChange={handleRollbackSelect}
              >
                <option value="">-- 롤백할 버전을 선택하세요 --</option>
                {versions.map(v => (
                  <option key={v.versionId} value={v.versionId}>
                    {v.versionName} ({new Date(v.createdAt).toLocaleDateString("ko-KR")})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;