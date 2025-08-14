import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getApprovedPlan } from '../api/auth.js';
import './ApprovedPlanViewer.css';

function ApprovedPlanViewer() {
    const { projectId } = useParams();
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (isLoading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!plan || !plan.planDocUrl) {
        return <div className="no-plan">승인된 기획안 문서가 없습니다.</div>;
    }

    return (
        <div className="component-placeholder">
            <h2>승인된 기획안 조회</h2>
            <p>프로젝트 ID {projectId}의 승인된 기획안 문서입니다.</p>

            <div className="pdf-viewer-container">
                <iframe
                    src={plan.planDocUrl}
                    title="기획안 PDF 뷰어"
                    width="100%"
                    height="800px"
                    style={{
                        border: 'none',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                    }}
                />
            </div>
        </div>
    );
}

export default ApprovedPlanViewer;
