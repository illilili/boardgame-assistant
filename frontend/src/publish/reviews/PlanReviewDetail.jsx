import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPlanDetails, reviewPlan } from '../../api/apiClient';

/**
 * PlanReviewDetail
 * - 선택한 기획안 상세 조회 (PDF 뷰어)
 * - 승인 / 반려 처리
 */
function PlanReviewDetail({ planId, onBack }) {
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await getPlanDetails(planId);
        setPlan(data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || '기획안 조회 실패';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  const handleApprove = async () => {
    if (!window.confirm('이 기획안을 승인하시겠습니까?')) return;
    try {
      setActionLoading(true);
      await reviewPlan({ planId, approve: true, reason: null });
      setStatusMessage('✅ 승인 처리 완료');
      onBack();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || '승인 처리 실패');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setStatusMessage('❌ 반려 사유를 작성해주세요.');
      return;
    }
    try {
      setActionLoading(true);
      await reviewPlan({ planId, approve: false, reason: rejectReason });
      setStatusMessage('❌ 반려 처리 완료');
      onBack();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || '반려 처리 실패');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>오류: {error}</div>;
  if (!plan) return <div style={{ padding: '2rem' }}>기획안 데이터를 불러오지 못했습니다.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>기획안 상세 검토</h1>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← 목록으로</button>

      <div style={{ marginBottom: '1rem' }}>
        <h3>{plan.projectTitle || `프로젝트 ID: ${plan.projectId}`}</h3>
        <p>기획안 ID: {plan.planId}</p>
        <p>제출일: {plan.submittedAt ? new Date(plan.submittedAt).toLocaleString() : '정보 없음'}</p>
      </div>

      {plan.planDocUrl ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <iframe
            src={plan.planDocUrl}
            title="기획안 PDF 뷰어"
            width="100%"
            height="800px"
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      ) : (
        <p style={{ color: '#666' }}>기획안 문서(PDF)가 업로드되지 않았습니다.</p>
      )}

      {/* 상태 메시지 영역 */}
      {statusMessage && (
        <div style={{ marginBottom: '1rem', color: statusMessage.includes('완료') ? 'green' : 'red' }}>
          {statusMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {/* 반려 사유 입력 */}
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="반려 사유를 입력하세요..."
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            resize: 'none'
          }}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '0.7rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✅ 승인
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
            style={{
              background: rejectReason.trim() ? '#f44336' : '#ccc',
              color: 'white',
              padding: '0.7rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: rejectReason.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            ❌ 반려
          </button>
        </div>
      </div>
    </div>
  );
}

PlanReviewDetail.propTypes = {
  planId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired
};

export default PlanReviewDetail;
