import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPendingPlans } from '../../api/apiClient';
import './PlanReviewsList.css';

/**
 * PlanReviewsList
 * - 제출된 기획안 목록 조회
 * - 항목 클릭 시 onSelect(planId) 실행 → Detail로 이동
 */
function PlanReviewsList({ onSelect, onBack }) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPendingPlans();
        setPlans(data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || '데이터 조회 실패';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (isLoading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>오류: {error}</div>;

  return (
    <div className="plan-reviews-wrapper">
      <h1>제출된 기획안 목록</h1>
      <p>기획안을 선택해 상세 내용을 검토할 수 있습니다.</p>

      {plans.length === 0 ? (
        <p>검토할 기획안이 없습니다.</p>
      ) : (
        <ul className="plan-reviews-list">
          {plans.map((plan) => (
            <li
              key={plan.planId}
              className="plan-reviews-item"
              onClick={() => onSelect(plan.planId)}
            >
              <div className="plan-reviews-header">
                <h3>{plan.projectTitle || `프로젝트 ID: ${plan.projectId}`}</h3>
                {plan.status && (
                  <span className="plan-status-badge">{plan.status}</span>
                )}
              </div>

              {/* 컨셉을 제목 바로 아래 라인 */}
              <div className="plan-reviews-sub">
                {plan.conceptTheme ? `컨셉: ${plan.conceptTheme}` : '컨셉 정보 없음'}
              </div>

              <div className="plan-reviews-meta">
                <span>기획안 ID: <b>{plan.planId}</b></span>
                <span>제출자: <b>{plan.submittedBy || '알 수 없음'}</b></span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

PlanReviewsList.propTypes = {
  onSelect: PropTypes.func.isRequired, // 클릭 시 상세보기 호출
  onBack: PropTypes.func               // 홈으로 돌아가기
};

export default PlanReviewsList;
