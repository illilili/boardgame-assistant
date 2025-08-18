import React, { useState, useEffect, useContext } from 'react';
import './Review.css';
import { getMyRulesByProject, runSimulation, analyzeBalance } from '../api/auth';
import { ProjectContext } from '../contexts/ProjectContext';
import { FaPlay, FaBalanceScale, FaExclamationTriangle, FaLightbulb, FaTrophy } from 'react-icons/fa';

const Review = () => {
    const { projectId } = useContext(ProjectContext);

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
            if (!projectId) {
                setRuleList([]);
                setRuleId('');
                return;
            }
            setIsLoading(true);
            try {
                const data = await getMyRulesByProject(projectId);
                setRuleList(data);
                if (data.length > 0) {
                    setRuleId(data[0].ruleId);
                } else {
                    setRuleId('');
                }
            } catch (err) {
                console.error(err);
                setError('규칙 목록을 가져올 수 없습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRules();
    }, [projectId]);

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
            const requestBody = {
                ruleId: parseInt(ruleId),
                playerNames: playerNames.split(',').map(name => name.trim()),
                maxTurns: parseInt(maxTurns),
                enablePenalty,
            };
            const data = await runSimulation(requestBody);
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
            const requestBody = { ruleId: parseInt(ruleId) };
            const data = await analyzeBalance(requestBody);
            setBalanceFeedback(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="review__container">

            {error && <div className="review__error-message">{error}</div>}

            {/* --- ✨ 1. 시뮬레이션 랩 --- */}
            <div className="review__lab-section">
                <div className="review__controls-column">
                    <h2>규칙 시뮬레이션</h2>
                    <p>가상 플레이어와 턴 수를 설정하여 게임이 어떻게 진행되는지 확인합니다.</p>
                    <form onSubmit={handleRunSimulation}>
                        <div className="review__form-group">
                            <label htmlFor="ruleId">규칙 선택</label>
                            <select id="ruleId" value={ruleId} onChange={(e) => setRuleId(e.target.value)} required disabled={ruleList.length === 0 || isLoading}>
                                <option value="" disabled>-- 규칙을 선택하세요 --</option>
                                {ruleList.map(rule => (
                                    <option key={rule.ruleId} value={rule.ruleId}>
                                        ID: {rule.ruleId} - {rule.gameName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="review__form-group">
                            <label htmlFor="playerNames">플레이어 이름 (쉼표로 구분)</label>
                            <input id="playerNames" type="text" value={playerNames} onChange={(e) => setPlayerNames(e.target.value)} required />
                        </div>
                        <div className="review__form-group">
                            <label htmlFor="maxTurns">최대 턴 수</label>
                            <input id="maxTurns" type="number" value={maxTurns} onChange={(e) => setMaxTurns(e.target.value)} min="1" required />
                        </div>
                        <div className="review__form-group review__checkbox-group">
                            <input id="enablePenalty" type="checkbox" checked={enablePenalty} onChange={(e) => setEnablePenalty(e.target.checked)} />
                            <label htmlFor="enablePenalty">페널티 규칙 적용</label>
                        </div>
                        <button type="submit" className="review__primary-button" disabled={isLoading || !ruleId}>
                            <FaPlay /> {isLoading ? '처리 중...' : '시뮬레이션 실행'}
                        </button>
                    </form>
                </div>
                <div className="review__results-column">
                    <h3>시뮬레이션 결과</h3>
                    {isLoading && <div className="review__spinner"></div>}
                    {simulationResult && !isLoading && (
                        <div className="review__simulation-result">
                            <div className="review__simulation-summary">
                                <FaTrophy className="summary-icon" />
                                <div className="summary-text">
                                    <strong>최종 결과: {simulationResult.simulationHistory[0].winner}</strong>
                                    <span>({simulationResult.simulationHistory[0].totalTurns}턴)</span>
                                </div>
                            </div>
                            <div className="review__simulation-log">
                                {simulationResult.simulationHistory[0].turns.map(turn => (
                                    <div key={turn.turn} className="review__turn-card">
                                        <div className="turn-header">턴 {turn.turn}</div>
                                        {turn.actions.map((action, index) => (
                                            <div key={index} className="review__action-item">
                                                <p><strong>{action.player}</strong>: {action.action} ({action.details})</p>
                                                <p className="rationale"><em>이유: {action.rationale}</em></p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isLoading && !simulationResult && <p className="initial-text">시뮬레이션을 실행하면 결과가 여기에 표시됩니다.</p>}
                </div>
            </div>

            {/* --- ✨ 2. 밸런스 분석 리포트 --- */}
            <div className="review__lab-section">
                <div className="review__controls-column">
                    <h2>AI 밸런스 분석</h2>
                    <p>선택된 규칙에 대한 AI의 전문적인 밸런스 분석 리포트를 받아봅니다.</p>
                    <button onClick={handleGetBalanceFeedback} className="review__secondary-button" disabled={isLoading || !ruleId}>
                        <FaBalanceScale /> {isLoading ? '처리 중...' : '밸런스 분석 요청'}
                    </button>
                </div>
                <div className="review__results-column">
                    <h3>밸런스 분석 리포트</h3>
                    {isLoading && <div className="review__spinner"></div>}
                    {balanceFeedback && balanceFeedback.balanceAnalysis && !isLoading && (
                        <div className="review__balance-report">
                            <div className="review__score-display">
                                <div className="score-value">{balanceFeedback.balanceAnalysis.balanceScore}</div>
                                <div className="score-label">AI 밸런스 평점</div>
                            </div>
                            <div className="report-content">
                                <p className="balance-summary"><strong>종합 평가:</strong> {balanceFeedback.balanceAnalysis.simulationSummary}</p>
                                <h4><FaExclamationTriangle /> 발견된 문제점</h4>
                                <ul className="review__balance-list">{balanceFeedback.balanceAnalysis.issuesDetected.map((issue, index) => <li key={index} className="issue">{issue}</li>)}</ul>
                                <h4><FaLightbulb /> 개선 제안</h4>
                                <ul className="review__balance-list">{balanceFeedback.balanceAnalysis.recommendations.map((rec, index) => <li key={index} className="recommendation">{rec}</li>)}</ul>
                            </div>
                        </div>
                    )}
                    {!isLoading && !balanceFeedback && <p className="initial-text">밸런스 분석을 요청하면 리포트가 여기에 표시됩니다.</p>}
                </div>
            </div>
        </div>
    );
};

export default Review;
