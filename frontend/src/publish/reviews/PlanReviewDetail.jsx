import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPlanDetails, reviewPlan } from '../../api/apiClient';
import DeveloperAssignModal from './DeveloperAssignModal';
import './PlanReviewDetail.css';

function PlanReviewDetail({ planId, onBack }) {
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // ✅ 새로 추가된 상태
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [approvedProject, setApprovedProject] = useState(null);

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

      // 승인 후 프로젝트 다시 조회
      const updatedPlan = await getPlanDetails(planId);
      if (updatedPlan.projectId) {
        setApprovedProject({
          projectId: updatedPlan.projectId,
          projectName: updatedPlan.projectTitle
        });
        setShowAssignModal(true);
      } else {
        onBack();
      }
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

      {/* 기존 상세 표시 */}
      <div style={{ marginBottom: '1rem' }}>
        <h3>{plan.projectTitle || `프로젝트 ID: ${plan.projectId}`}</h3>
        <p>기획안 ID: {plan.planId}</p>
      </div>

      {plan.planDocUrl ? (
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
      ) : (
        <p style={{ color: '#666' }}>기획안 문서(PDF)가 업로드되지 않았습니다.</p>
      )}

      {/* 상태 메시지 */}
      {statusMessage && (
        <div style={{ marginBottom: '1rem', color: statusMessage.includes('완료') ? 'green' : 'red' }}>
          {statusMessage}
        </div>
      )}

      {/* 승인/반려 버튼 */}
      <textarea
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="반려 사유를 입력하세요..."
        rows={3}
        className="reject-textarea"
      />

      <div className="plan-actions">
        <div className="plan-actions-left">
          <button
            className="plan-button button-approve"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            ✅ 승인
          </button>
          <button
            className="plan-button button-reject"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            ❌ 반려
          </button>
        </div>
        <div className="plan-actions-right">
          <button onClick={onBack} className="back-btn">
            ← 목록으로
          </button>
        </div>
      </div>

      {/* ✅ 승인 후 개발자 배정 모달 */}
      {showAssignModal && approvedProject && (
        <DeveloperAssignModal
          project={approvedProject}
          onClose={() => {
            setShowAssignModal(false);
            onBack();
          }}
        />
      )}
    </div>
  );
}

PlanReviewDetail.propTypes = {
  planId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired
};

export default PlanReviewDetail;
