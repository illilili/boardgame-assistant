import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { reviewPlan, getPlanDetails } from '../api/apiClient.js'; // getPlanDetails 추가

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;


const ReviewDetailPage = () => {
    const { planId } = useParams();
    const navigate = useNavigate();

    const [planDetails, setPlanDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [numPages, setNumPages] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const fetchPlanData = async () => {
            if (!planId) return;
            setIsLoading(true);
            try {
                const data = await getPlanDetails(planId);
                setPlanDetails(data);
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message;
                setError(`데이터 로딩 실패: ${errorMsg}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlanData();
    }, [planId]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleReview = async (isApprove) => {
        if (!isApprove && !rejectionReason.trim()) {
            alert('반려 사유를 입력해주세요.');
            return;
        }
        if (!window.confirm(`정말로 이 기획안을 ${isApprove ? '승인' : '반려'}하시겠습니까?`)) return;

        try {
            await reviewPlan({
                planId: Number(planId),
                approve: isApprove,
                reason: rejectionReason
            });
            alert(`기획안이 성공적으로 ${isApprove ? '승인' : '반려'}되었습니다.`);
            if (isApprove) {
                navigate(`/assign-developer/${planDetails.projectId}`);
            } else {
                navigate('/reviews');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || '처리 중 오류 발생';
            alert(`오류: ${errorMsg}`);
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>기획안 정보를 불러오는 중...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
    if (!planDetails) return <div style={{ padding: '2rem' }}>기획안 정보가 없습니다.</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'row' }}>
            <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
                <Document
                    file={planDetails.planDocUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => alert(`PDF 로드 오류: ${error.message}`)}
                    loading={<div style={{ padding: '2rem' }}>PDF 문서를 불러오는 중...</div>}
                >
                    {Array.from(new Array(numPages || 0), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                    ))}
                </Document>
            </div>
            <div style={{ width: '320px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h2>기획안 검토</h2>
                <h3 style={{wordBreak: 'break-all'}}>{planDetails.projectTitle || `프로젝트 ID: ${planDetails.projectId}`}</h3>
                <p>기획안 ID: {planId}</p>
                <hr style={{margin: '1rem 0'}}/>
                <div style={{ marginTop: '1rem' }}>
                    <button onClick={() => handleReview(true)} style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', backgroundColor: '#2f855a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        👍 승인
                    </button>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <textarea 
                        placeholder="반려 사유를 입력하세요"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        style={{ width: 'calc(100% - 16px)', height: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                    <button onClick={() => handleReview(false)} style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', backgroundColor: '#c53030', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '0.5rem' }}>
                        👎 반려
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetailPage;