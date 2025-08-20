import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getComponentDetail, reviewComponent } from '../../api/apiClient';
import './ComponentReviewDetail.css';

function ComponentReviewDetail({ componentId, onBack }) {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getComponentDetail(componentId);
        setComponent(data);
      } catch (err) {
        setStatusMessage(err.response?.data?.message || '상세 조회 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [componentId]);

  const handleDecision = async (approve) => {
    if (!approve && !rejectReason.trim()) {
      setStatusMessage('❌ 반려 사유를 입력해주세요.');
      return;
    }

    try {
      setActionLoading(true);
      await reviewComponent({ componentId, approve, reason: approve ? null : rejectReason });
      setStatusMessage(approve ? '✅ 승인되었습니다.' : '❌ 반려되었습니다.');
      setRejectReason('');
    } catch (err) {
      setStatusMessage(err.response?.data?.message || '처리 실패');
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = (item) => {
    const type = (item.contentType || item.subTaskType || '').toLowerCase();

    if (!item.contentData) return <p className="empty-content">내용 없음</p>;

    if (type.includes('image') || /\.(png|jpg|jpeg|gif)$/i.test(item.contentData)) {
      return (
        <div className="content-preview">
          <img src={item.contentData} alt="미리보기" />
        </div>
      );
    }

    if (type.includes('3d') || /\.glb$/i.test(item.contentData)) {
      return (
        <div className="content-preview">
          <model-viewer
            src={item.contentData}
            alt="3D 모델"
            auto-rotate
            camera-controls
            style={{ width: '400px', height: '400px', margin: 'auto', display: 'block' }}
          />
        </div>
      );
    }

    if (type.includes('pdf') || /\.pdf$/i.test(item.contentData)) {
      return (
        <iframe
          src={item.contentData}
          title="PDF 미리보기"
          width="100%"
          height="500px"
          style={{ border: '1px solid #ccc', display: 'block', margin: 'auto' }}
        />
      );
    }

    return <pre className="content-text">{item.contentData}</pre>;
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!component) return <div className="error">컴포넌트 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="review-detail-container">
      <h1 className="detail-title">컴포넌트 상세 검토</h1>

      <div className="detail-header">
        <h3>{component.title}</h3>
      </div>

      {statusMessage && (
        <div className={`status-message ${statusMessage.includes('되었습니다') ? 'success' : 'error'}`}>
          {statusMessage}
        </div>
      )}

      <ul className="item-list">
        {component.items
          ?.sort((a, b) => {
            // 카드 컴포넌트: 이미지 먼저 나오게
            if (
              (a.subTaskType === 'IMAGE' && b.subTaskType === 'TEXT') ||
              (a.subTaskType?.toLowerCase().includes('image') && b.subTaskType?.toLowerCase().includes('text'))
            ) {
              return -1;
            }
            if (
              (a.subTaskType === 'TEXT' && b.subTaskType === 'IMAGE') ||
              (a.subTaskType?.toLowerCase().includes('text') && b.subTaskType?.toLowerCase().includes('image'))
            ) {
              return 1;
            }
            return 0;
          })
          .map((item) => (
            <li key={item.contentId} className="item-row">
              <span className={`comp-type ${item.subTaskType?.toLowerCase()}`}>
                {item.subTaskType}
              </span>
              {renderContent(item)}
            </li>
          ))}
      </ul>

      <textarea
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="반려 사유 입력..."
        rows={3}
        className="reject-textarea"
      />

      <div className="action-buttons">
        <div className="left-buttons">
          <button
            onClick={() => handleDecision(true)}
            disabled={actionLoading}
            className="approve-btn"
          >
            ✅ 승인
          </button>
          <button
            onClick={() => handleDecision(false)}
            disabled={actionLoading || !rejectReason.trim()}
            className="reject-btn"
          >
            ❌ 반려
          </button>
        </div>
        <button onClick={onBack} className="back-btn">
          ← 목록으로
        </button>
      </div>
    </div>
  );
}

ComponentReviewDetail.propTypes = {
  componentId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ComponentReviewDetail;
