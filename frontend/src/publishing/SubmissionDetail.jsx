// SubmissionDetail.jsx
import React, { useState } from 'react';
import './SubmissionDetail.css';

function SubmissionDetail({ submission, onAddMessage }) {
  const [newMessage, setNewMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      onAddMessage(submission.submissionId, newMessage);
      setNewMessage('');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewMessage('');
    setIsEditing(false);
  };

  return (
    <div className="submission-detail">
      <div className="detail-header">
        <h2>{submission.gameTitle}</h2>
        <div className="submission-info">
          <span className="submission-id">제출 ID: {submission.submissionId}</span>
          <span className="submitted-date">제출일: {submission.submittedAt}</span>
          <span className={`status-badge ${submission.status.toLowerCase()}`}>
            {submission.status === 'PENDING' ? '검토중' : 
             submission.status === 'APPROVED' ? '승인됨' : '반려됨'}
          </span>
        </div>
      </div>

      <div className="detail-content">
        <div className="game-details-section">
          <h3>게임 상세 정보</h3>
          <div className="game-details-grid">
            <div className="detail-item">
              <label>테마:</label>
              <span>{submission.gameDetails.theme}</span>
            </div>
            <div className="detail-item">
              <label>플레이어 수:</label>
              <span>{submission.gameDetails.playerCount}</span>
            </div>
            <div className="detail-item">
              <label>플레이 시간:</label>
              <span>{submission.gameDetails.playTime}</span>
            </div>
            <div className="detail-item">
              <label>난이도:</label>
              <span>{submission.gameDetails.difficulty}</span>
            </div>
            <div className="detail-item full-width">
              <label>구성요소:</label>
              <span>{submission.gameDetails.components.join(', ')}</span>
            </div>
            <div className="detail-item full-width">
              <label>게임 규칙:</label>
              <span>{submission.gameDetails.rules}</span>
            </div>
            <div className="detail-item full-width">
              <label>게임 목표:</label>
              <span>{submission.gameDetails.goal}</span>
            </div>
          </div>
        </div>

        <div className="submission-message-section">
          <h3>제출 메시지</h3>
          <div className="message-container">
            {submission.submissionMessage ? (
              <div className="current-message">
                <p>{submission.submissionMessage}</p>
              </div>
            ) : (
              <div className="no-message">
                <p>제출 메시지가 없습니다.</p>
              </div>
            )}
          </div>

          <div className="message-actions">
            {!isEditing ? (
              <button 
                className="btn-primary"
                onClick={() => setIsEditing(true)}
              >
                {submission.submissionMessage ? '메시지 수정' : '메시지 추가'}
              </button>
            ) : (
              <div className="message-edit-form">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="제출 메시지를 입력하세요..."
                  rows={4}
                  className="message-textarea"
                />
                <div className="form-actions">
                  <button 
                    className="btn-primary"
                    onClick={handleAddMessage}
                  >
                    저장
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleCancel}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="submitter-info-section">
          <h3>제출자 정보</h3>
          <div className="submitter-details">
            <div className="detail-item">
              <label>사용자 ID:</label>
              <span>{submission.userId}</span>
            </div>
            <div className="detail-item">
              <label>제출자 ID:</label>
              <span>{submission.submitterId}</span>
            </div>
            <div className="detail-item">
              <label>프로젝트 ID:</label>
              <span>{submission.projectId}</span>
            </div>
            <div className="detail-item">
              <label>콘텐츠 ID:</label>
              <span>{submission.contentId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetail;
