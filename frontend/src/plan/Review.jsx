import React, { useState, useEffect } from 'react';
import './Review.css';

const Review = () => {
    const [ruleList, setRuleList] = useState([]);
    const [ruleId, setRuleId] = useState('');
    const [playerNames, setPlayerNames] = useState('탐험가 A, 공학자 B');
    const [maxTurns, setMaxTurns] = useState(10);
    const [enablePenalty, setEnablePenalty] = useState(true);
    const [simulationResult, setSimulationResult] = useState(null);
    const [balanceFeedback, setBalanceFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRules = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8080/api/balance/rules');
                if (!response.ok) {
                    throw new Error('규칙 목록을 불러오는 데 실패했습니다.');
                }
                const data = await response.json();
                setRuleList(data);
                if (data.length > 0) {
                    setRuleId(data[0].ruleId);
                }
            } catch (err) {
                setError('규칙 목록을 가져올 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRules();
    }, []);

    const handleRunSimulation = async (e) => {
        e.preventDefault();
        if (!ruleId) {
            setError('먼저 규칙을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSimulationResult(null);

        try {
            const response = await fetch('http://localhost:8080/api/balance/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ruleId: parseInt(ruleId),
                    playerNames: playerNames.split(',').map(name => name.trim()),
                    maxTurns: parseInt(maxTurns),
                    enablePenalty,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '시뮬레이션 서버에서 오류가 발생했습니다.');
            }
            const data = await response.json();
            setSimulationResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetBalanceFeedback = async () => {
        if (!ruleId) {
            setError('먼저 규칙을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setBalanceFeedback(null);

        try {
            const response = await fetch('http://localhost:8080/api/balance/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ruleId: parseInt(ruleId) }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '밸런스 분석 서버에서 오류가 발생했습니다.');
            }
            const data = await response.json();
            setBalanceFeedback(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="review-container">
            <header className="review-header">
                <h1>규칙 시뮬레이션 및 밸런스 검토</h1>
                <p>AI를 통해 게임 규칙의 실제 플레이 양상을 예측하고, 잠재적인 밸런스 문제를 분석합니다.</p>
            </header>

            <main className="review-main-grid">
                <div className="controls-column">
                    <div className="card">
                        <h2>규칙 시뮬레이션</h2>
                        <form onSubmit={handleRunSimulation}>
                            <div className="form-group">
                                <label htmlFor="ruleId">규칙 선택</label>
                                <select
                                    id="ruleId"
                                    value={ruleId}
                                    onChange={(e) => setRuleId(e.target.value)}
                                    required
                                    disabled={ruleList.length === 0 || isLoading}
                                >
                                    <option value="" disabled>-- 규칙을 선택하세요 --</option>
                                    {ruleList.map(rule => (
                                        <option key={rule.ruleId} value={rule.ruleId}>
                                            ID: {rule.ruleId} - {rule.gameName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="playerNames">플레이어 이름 (쉼표로 구분)</label>
                                <input
                                    id="playerNames"
                                    type="text"
                                    value={playerNames}
                                    onChange={(e) => setPlayerNames(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="maxTurns">최대 턴 수</label>
                                <input
                                    id="maxTurns"
                                    type="number"
                                    value={maxTurns}
                                    onChange={(e) => setMaxTurns(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    id="enablePenalty"
                                    type="checkbox"
                                    checked={enablePenalty}
                                    onChange={(e) => setEnablePenalty(e.target.checked)}
                                />
                                <label htmlFor="enablePenalty">페널티 규칙 적용</label>
                            </div>
                            <button type="submit" className="primary-button" disabled={isLoading}>
                                {isLoading ? '처리 중...' : '시뮬레이션 실행'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h2>AI 밸런스 분석</h2>
                        <p>선택된 규칙에 대한 AI의 전문적인 밸런스 분석 리포트를 받아봅니다.</p>
                        <button onClick={handleGetBalanceFeedback} className="secondary-button" disabled={isLoading}>
                            {isLoading ? '처리 중...' : '밸런스 분석 요청'}
                        </button>
                    </div>
                </div>

                <div className="results-column">
                    <div className="card">
                        {error && <div className="error-message">{error}</div>}
                        <div className="results-section">
                            <h3>시뮬레이션 결과</h3>
                            {isLoading && <div className="spinner"></div>}
                            {simulationResult && !isLoading && (
                                <div>
                                    <h4>🏆 최종 결과: {simulationResult.simulationHistory[0].winner} ({simulationResult.simulationHistory[0].totalTurns}턴)</h4>
                                    <div className="simulation-log">
                                        {simulationResult.simulationHistory[0].turns.map(turn => (
                                            <div key={turn.turn} className="turn-card">
                                                <h4>[ {turn.turn}턴 ]</h4>
                                                {turn.actions.map((action, index) => (
                                                    <div key={index} className="action-item">
                                                        <p><strong>{action.player}</strong>: {action.action} ({action.details})</p>
                                                        <p><em>이유: {action.rationale}</em></p>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!isLoading && !simulationResult && <p>시뮬레이션을 실행하면 결과가 여기에 표시됩니다.</p>}
                        </div>
                        <hr style={{border: "none", borderTop: "1px solid #eef2f7", margin: "2rem 0"}} />
                        <div className="results-section">
                            <h3>밸런스 분석 리포트</h3>
                            {isLoading && <div className="spinner"></div>}
                            {/* [수정] balanceFeedback과 balanceFeedback.balanceAnalysis가 모두 존재하는지 확인 */}
                            {balanceFeedback && balanceFeedback.balanceAnalysis && !isLoading && (
                                <div>
                                    <p><strong>종합 평가:</strong> {balanceFeedback.balanceAnalysis.simulationSummary}</p>
                                    
                                    <h4>발견된 문제점</h4>
                                    <ul className="balance-list">
                                        {balanceFeedback.balanceAnalysis.issuesDetected.map((issue, index) => (
                                            <li key={index} className="issue">{issue}</li>
                                        ))}
                                    </ul>

                                    <h4>개선 제안</h4>
                                    <ul className="balance-list">
                                        {balanceFeedback.balanceAnalysis.recommendations.map((rec, index) => (
                                            <li key={index} className="recommendation">{rec}</li>
                                        ))}
                                    </ul>
                                    
                                    <div className="score-display">
                                        <div className="score-value">{balanceFeedback.balanceAnalysis.balanceScore} / 10</div>
                                        <div className="score-label">AI 밸런스 평점</div>
                                    </div>
                                </div>
                            )}
                            {!isLoading && !balanceFeedback && <p>밸런스 분석을 요청하면 리포트가 여기에 표시됩니다.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Review;