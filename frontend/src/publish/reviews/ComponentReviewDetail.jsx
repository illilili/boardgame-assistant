import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getComponentDetail, reviewComponent } from '../../api/apiClient';

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
      setStatusMessage(approve ? '✅ 승인 완료' : '❌ 반려 완료');
      setRejectReason('');
      onBack(); // ✅ 성공 후 목록으로 이동
    } catch (err) {
      setStatusMessage(err.response?.data?.message || '처리 실패');
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = (item) => {
    const type = (item.contentType || item.subTaskType || '').toLowerCase();

    if (!item.contentData) return <p style={{ color: '#888' }}>내용 없음</p>;

    if (type.includes('image') || /\.(png|jpg|jpeg|gif)$/i.test(item.contentData)) {
      return <img src={item.contentData} alt="미리보기" style={{ maxWidth: '300px', border: '1px solid #ccc' }} />;
    }

    if (type.includes('3d') || /\.glb$/i.test(item.contentData)) {
      return (
        <model-viewer
          src={item.contentData}
          alt="3D 모델"
          auto-rotate
          camera-controls
          style={{ width: '400px', height: '400px' }}
        />
      );
    }

    if (type.includes('pdf') || /\.pdf$/i.test(item.contentData)) {
      return (
        <iframe
          src={item.contentData}
          title="PDF 미리보기"
          width="100%"
          height="500px"
          style={{ border: '1px solid #ccc' }}
        />
      );
    }

    return (
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '0.5rem' }}>
        {item.contentData}
      </pre>
    );
  };

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;
  if (!component) return <div style={{ padding: '2rem', color: 'red' }}>컴포넌트 정보를 불러올 수 없습니다.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>컴포넌트 상세 검토</h1>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← 목록으로</button>

      <div style={{ marginBottom: '1rem' }}>
        <h3>{component.title}</h3>
        <p>타입: {component.type}</p>
        <p>상태: {component.status}</p>
      </div>

      {statusMessage && (
        <div style={{ marginBottom: '1rem', color: statusMessage.includes('완료') ? 'green' : 'red' }}>
          {statusMessage}
        </div>
      )}

      <h3>세부 항목</h3>
      <ul>
        {component.items?.map((item) => (
          <li key={item.contentId} style={{ marginBottom: '1.5rem' }}>
            <p><b>SubTask:</b> {item.subTaskType} ({item.subTaskStatus})</p>
            {item.note && <p><b>비고:</b> {item.note}</p>}
            {renderContent(item)}
          </li>
        ))}
      </ul>

      <textarea
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="반려 사유 입력..."
        rows={3}
        style={{
          width: '100%',
          marginBottom: '1rem',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          resize: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => handleDecision(true)}
          disabled={actionLoading}
          style={{
            background: '#4CAF50',
            color: 'white',
            padding: '0.7rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: actionLoading ? 'not-allowed' : 'pointer',
          }}
        >
          ✅ 승인
        </button>
        <button
          onClick={() => handleDecision(false)}
          disabled={actionLoading || !rejectReason.trim()}
          style={{
            background: rejectReason.trim() ? '#f44336' : '#ccc',
            color: 'white',
            padding: '0.7rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: actionLoading || !rejectReason.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          ❌ 반려
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
