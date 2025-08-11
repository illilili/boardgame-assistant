import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getApprovedPlan } from '../api/auth.js';
import './ApprovedPlanViewer.css';

function ApprovedPlanViewer() {
    const { projectId } = useParams();
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 🚨 모달의 열림/닫힘 상태를 관리하는 state 추가
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchApprovedPlan = async () => {
            try {
                if (projectId) {
                    const data = await getApprovedPlan(projectId);
                    setPlan(data);
                }
            } catch (err) {
                console.error('승인된 기획안 불러오기 실패:', err);
                setError(err.message || '승인된 기획안을 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchApprovedPlan();
    }, [projectId]);

    // 🚨 모달을 여는 함수
    const openModal = () => {
        if (plan) {
            setIsModalOpen(true);
        }
    };
    
    // 🚨 모달을 닫는 함수
    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (isLoading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="component-placeholder">
            <h2>[개발] 승인된 기획안 문서조회</h2>
            <p>프로젝트 ID {projectId}의 승인된 기획안 문서입니다.</p>

            {plan && (
                <div className="plan-list-container">
                    <ul className="plan-list">
                        <li
                            key={plan.planId}
                            // 🚨 클릭 시 새 탭 대신 모달을 열도록 수정
                            onClick={openModal}
                            className="plan-list-item"
                            title={`${plan.planId}번 기획안 상세 정보 보기`}
                        >
                            <span className="plan-title">기획안 ID: {plan.planId}</span>
                            <span className="plan-status">{plan.status}</span>
                        </li>
                    </ul>
                </div>
            )}
            {!plan && !isLoading && <div className="no-plan">승인된 기획안이 없습니다.</div>}
            
            {/* 🚨 모달 UI 추가 */}
            {isModalOpen && plan && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>기획안 상세 정보 (ID: {plan.planId})</h3>
                            <button onClick={closeModal} className="modal-close-button">&times;</button>
                        </div>
                        <div className="modal-body">
                            <h4>기획안 내용</h4>
                            <pre className="plan-content-box">{plan.currentContent}</pre>
                            <h4>기획안 문서</h4>
                            {plan.planDocUrl ? (
                                <a href={plan.planDocUrl} target="_blank" rel="noopener noreferrer" className="plan-doc-link">
                                    문서 열기 ({plan.planDocUrl.split('/').pop()})
                                </a>
                            ) : (
                                <p>업로드된 문서가 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApprovedPlanViewer;