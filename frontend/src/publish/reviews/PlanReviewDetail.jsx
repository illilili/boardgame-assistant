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
      setStatusMessage('승인 처리가 완료되었습니다. 프로젝트가 생성되었습니다.');

      const updatedPlan = await getPlanDetails(planId);
      if (updatedPlan.projectId) {
        setApprovedProject({
          projectId: updatedPlan.projectId,
          projectName: updatedPlan.projectTitle
        });
        setShowAssignModal(true);
      } else {
        setTimeout(onBack, 1500);
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || '승인 처리 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setStatusMessage('반려 사유를 작성해주세요.');
      return;
    }
    try {
      setActionLoading(true);
      await reviewPlan({ planId, approve: false, reason: rejectReason });
      setStatusMessage('반려 처리가 완료되었습니다.');
      setTimeout(onBack, 1500);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || '반려 처리 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="plan-detail-state-info">로딩 중...</div>;
  if (error) return <div className="plan-detail-state-info plan-detail-state-info--error">오류: {error}</div>;
  if (!plan) return <div className="plan-detail-state-info">기획안 데이터를 불러오지 못했습니다.</div>;

  const isSuccessMessage = statusMessage.includes('완료') || statusMessage.includes('생성');

  return (
    <div className="plan-detail-wrapper">
      <header className="plan-detail-header">
        <h1>{plan.projectTitle || `프로젝트 ID: ${plan.projectId}`}</h1>
        <div className="plan-detail-meta">
          <span>기획안 ID: <b>{plan.planId}</b></span>
          <span>제출자: <b>{plan.submittedBy || '알 수 없음'}</b></span>
        </div>
      </header>

      {plan.planDocUrl ? (
        <iframe
          src={plan.planDocUrl}
          title="기획안 PDF 뷰어"
          className="plan-detail-viewer"
        />
      ) : (
        <div className="plan-detail-viewer--empty">
          기획안 문서(PDF)가 업로드되지 않았습니다.
        </div>
      )}

      {statusMessage && (
        <div className={`plan-detail-status-message ${isSuccessMessage ? 'plan-detail-status-message--success' : 'plan-detail-status-message--error'}`}>
          {statusMessage}
        </div>
      )}

      <div className="plan-detail-decision-area">
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="반려 시 사유를 반드시 입력해주세요..."
          rows={4}
          className="plan-detail-reject-textarea"
        />
        <div className="plan-detail-actions">
          <div className="plan-detail-actions__left">
            <button
              className="plan-detail-button plan-detail-button--approve"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              승인
            </button>
            <button
              className="plan-detail-button plan-detail-button--reject"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              반려
            </button>
          </div>
          <div className="plan-detail-actions__right">
            <button onClick={onBack} className="plan-detail-button plan-detail-button--back">
              ← 목록으로
            </button>
          </div>
        </div>
      </div>

      {showAssignModal && approvedProject && (
        <DeveloperAssignModal
          project={approvedProject}
          onClose={() => {
            setShowAssignModal(false);
            onBack();
          }}
          onSuccess={onBack}
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