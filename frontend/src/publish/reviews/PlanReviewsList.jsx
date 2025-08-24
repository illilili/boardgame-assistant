import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPendingPlans } from '../../api/apiClient';
import { FiFileText, FiInbox } from 'react-icons/fi'; // 아이콘 추가
import './PlanReviewsList.css';

function maskName(name) {
  if (!name) return '알 수 없음';
  if (name.length === 2) {
    return name[0] + '*';
  }
  if (name.length > 2) {
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  }
  return name;
}


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

  if (isLoading) return <div className="plan-reviews-state-info">로딩 중...</div>;
  if (error) return <div className="plan-reviews-state-info plan-reviews-state-info--error">오류: {error}</div>;

  return (
    <div className="plan-reviews-wrapper">
      <header className="plan-reviews-page-header">
        <h1>제출된 기획안 목록</h1>
        <p>기획안을 선택해 상세 내용을 검토할 수 있습니다.</p>
      </header>

      {plans.length === 0 ? (
        <div className="plan-reviews-empty">
          <FiInbox className="plan-reviews-empty__icon" />
          <p className="plan-reviews-empty__text">검토할 새로운 기획안이 없습니다.</p>
        </div>
      ) : (
        <ul className="plan-reviews-list">
          {plans.map((plan) => (
            <li
              key={plan.planId}
              className="plan-reviews-item"
              onClick={() => onSelect(plan.planId)}
              tabIndex="0" // 키보드 접근성
            >
              <div className="plan-reviews-item__icon-wrapper">
                <FiFileText />
              </div>
              <div className="plan-reviews-item__content">
                <div className="plan-reviews-item__header">
                  <h3>{plan.projectTitle || `프로젝트 ID: ${plan.projectId}`}</h3>
                  {plan.status && (
                    <span className="plan-reviews-item__status-badge">{plan.status}</span>
                  )}
                </div>
                <p className="plan-reviews-item__sub">
                  {plan.conceptTheme ? `컨셉: ${plan.conceptTheme}` : '컨셉 정보 없음'}
                </p>
                <div className="plan-reviews-item__meta">
                  <span>ID: <b>{plan.planId}</b></span>
                  <span>제출자: <b>{maskName(plan.submittedBy)}</b></span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

PlanReviewsList.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default PlanReviewsList;