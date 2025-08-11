import React, { useState, useEffect } from 'react';
import { getPendingPlans, reviewPlan } from '../api/auth.js';

// PlanReviewPage 전용 스타일
const PlanReviewPageStyles = `
    .review-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    .review-header {
        margin-bottom: 2rem;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 1rem;
    }
    .plan-list-section {
        background-color: #f8fafc;
        padding: 1rem;
        border-radius: 8px;
    }
    .plan-card {
        background-color: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .plan-card h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .plan-card p {
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 0.25rem;
    }
    .plan-card-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
    }
    .plan-card-actions button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        border: none;
    }
    .approve-button {
        background-color: #2f855a;
        color: white;
    }
    .reject-button {
        background-color: #c53030;
        color: white;
    }
    .reason-input {
        width: 100%;
        margin-top: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
    }
    .spinner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
    }
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top-color: #4c51bf;
        border-radius: 50%;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .error-message {
        padding: 1rem;
        background-color: #fef2f2;
        color: #991b1b;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
        margin-top: 1rem;
    }
`;

const PlanReviewPage = () => {
    const [pendingPlans, setPendingPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [rejectionReason, setRejectionReason] = useState({});

    const fetchPendingPlans = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingPlans();
            setPendingPlans(data);
        } catch (err) {
            setError('제출된 기획안 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReviewPlan = async (planId, isApprove) => {
        const reason = isApprove ? '' : rejectionReason[planId] || '';

        if (!isApprove && !reason.trim()) {
            alert('반려 사유를 입력해주세요.');
            return;
        }

        if (window.confirm(`${isApprove ? '승인' : '반려'} 처리하시겠습니까?`)) {
            try {
                await reviewPlan({
                    planId: planId,
                    approve: isApprove,
                    reason: reason
                });
                alert(`기획안이 성공적으로 ${isApprove ? '승인' : '반려'}되었습니다!`);
                fetchPendingPlans(); // 목록 새로고침
            } catch (err) {
                alert(`${isApprove ? '승인' : '반려'} 실패: ${err.message}`);
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchPendingPlans();
    }, []);

    if (isLoading) {
        return (
            <div className="spinner-container">
                <style>{PlanReviewPageStyles}</style>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-container">
                <style>{PlanReviewPageStyles}</style>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="review-container">
            <style>{PlanReviewPageStyles}</style>
            <header className="review-header">
                <h1 className="text-2xl font-bold">기획안 검토 (관리자/퍼블리셔)</h1>
                <p>제출된 기획안을 검토하고 승인 또는 반려할 수 있습니다.</p>
            </header>
            <div className="plan-list-section">
                {pendingPlans.length > 0 ? (
                    pendingPlans.map(plan => (
                        <div key={plan.planId} className="plan-card">
                            <h3>프로젝트: {plan.projectTitle}</h3>
                            <p><strong>기획안 ID:</strong> {plan.planId}</p>
                            <p><strong>컨셉:</strong> {plan.conceptTheme}</p>
                            <p><strong>상태:</strong> {plan.status}</p>
                            <p><strong>문서 URL:</strong> <a href={plan.planDocUrl} target="_blank" rel="noopener noreferrer">{plan.planDocUrl}</a></p>
                            <div className="plan-card-actions">
                                <button
                                    onClick={() => handleReviewPlan(plan.planId, true)}
                                    className="approve-button"
                                >
                                    승인
                                </button>
                                <button
                                    onClick={() => handleReviewPlan(plan.planId, false)}
                                    className="reject-button"
                                >
                                    반려
                                </button>
                                <input
                                    type="text"
                                    className="reason-input"
                                    placeholder="반려 사유 입력 (반려 시 필수)"
                                    value={rejectionReason[plan.planId] || ''}
                                    onChange={(e) => setRejectionReason({
                                        ...rejectionReason,
                                        [plan.planId]: e.target.value
                                    })}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">현재 검토할 기획안이 없습니다.</p>
                )}
            </div>
        </div>
    );
};
export default PlanReviewPage;
