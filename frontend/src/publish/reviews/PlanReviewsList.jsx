import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPendingPlans } from '../../api/apiClient';

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
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>제출된 기획안 목록</h1>
      <p>기획안을 선택해 상세 내용을 검토할 수 있습니다.</p>
      <hr />
      {plans.length === 0 ? (
        <p>검토할 기획안이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {plans.map((plan) => (
            <li
              key={plan.planId}
              onClick={() => onSelect(plan.planId)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                marginBottom: '1rem',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow .2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <h3 style={{ marginTop: 0, marginBottom: 6 }}>
                  {plan.projectTitle || `프로젝트 ID: ${plan.projectId}`}
                </h3>
                {/* 상태 뱃지 */}
                {plan.status && (
                  <span
                    style={{
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 999,
                      background: '#eef2ff',
                      color: '#3730a3',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {plan.status}
                  </span>
                )}
              </div>

              {/* 부제 정보 라인 */}
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 6 }}>
                {plan.conceptTheme ? `컨셉: ${plan.conceptTheme}` : '컨셉 정보 없음'}
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', color: '#4b5563', fontSize: 14 }}>
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
