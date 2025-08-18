import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingPlans } from '../api/apiClient.js';

const PendingReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getPendingPlans();
                setReviews(data);
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || '데이터 조회 실패';
                setError(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (isLoading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>오류: {error}</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
            <h1>검토 대기중인 기획안</h1>
            <p>기획안을 클릭하여 검토를 진행하세요.</p>
            <hr />
            {reviews.length === 0 ? (
                <p>검토할 기획안이 없습니다.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {reviews.map(review => (
                        <li key={review.planId} style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}>
                            {/* ✅ state prop을 제거하여 더 안정적으로 만듭니다. */}
                            <Link 
                                to={`/review/${review.planId}`}
                                style={{ display: 'block', padding: '1.5rem', textDecoration: 'none', color: 'inherit' }}
                            >
                                <h3 style={{ marginTop: 0 }}>{review.projectTitle || `프로젝트 ID: ${review.projectId}`}</h3>
                                <p style={{ margin: 0, color: '#555' }}>기획안 ID: {review.planId}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingReviewsPage;