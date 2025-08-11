import React, { useState, useEffect } from 'react';
import './Pricing.css';

const Pricing = () => {
    const [planList, setPlanList] = useState([]);
    const [planId, setPlanId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // 🔹 기획서 목록 가져오기
    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:8080/api/plans');
                if (!res.ok) throw new Error('기획서 목록 불러오기 실패');
                const data = await res.json();
                setPlanList(data);
                if (data.length > 0) setPlanId(data[0].planId);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // 🔹 가격 책정 요청
    const handleEstimate = async () => {
        if (!planId) {
            setError('먼저 기획서를 선택하세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch('http://localhost:8000/api/ai-pricing/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: parseInt(planId) })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || '가격 책정 실패');
            }
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pricing-container">
            <header className="pricing-header">
                <h1>📊 AI 가격 산정</h1>
                <p>기획서를 기반으로 보드게임 가격을 예측합니다.</p>
            </header>

            <div className="card">
                <div className="form-group">
                    <label htmlFor="planId">기획서 선택</label>
                    <select
                        id="planId"
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                        disabled={isLoading || planList.length === 0}
                    >
                        {planList.length === 0 ? (
                            <option>기획서 없음</option>
                        ) : (
                            planList.map(plan => (
                                <option key={plan.planId} value={plan.planId}>
                                    ID: {plan.planId} - {plan.planName}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <button 
                    className="primary-button" 
                    onClick={handleEstimate} 
                    disabled={isLoading || planList.length === 0}
                >
                    {isLoading ? '처리 중...' : '가격 책정'}
                </button>

                {isLoading && <div className="spinner"></div>}
                {error && <div className="error-message">{error}</div>}

                {result && !isLoading && (
                    <div className="result-box">
                        <div className="result-price">💵 {result.predicted_price}</div>
                        <div className="result-kor">({result.kor_price})</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pricing;
