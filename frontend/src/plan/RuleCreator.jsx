import React, { useState, useEffect } from 'react';
import './RuleCreator.css';

const RuleCreator = () => {
    const [concepts, setConcepts] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [generatedRules, setGeneratedRules] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // [추가] 재생성을 위한 피드백 상태
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchConcepts = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/plans/concepts');
                if (!response.ok) throw new Error('컨셉 목록을 불러오는 데 실패했습니다.');
                const data = await response.json();
                setConcepts(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchConcepts();
    }, []);

    const handleGenerateRules = async () => {
        if (!selectedConceptId) {
            setError('먼저 규칙을 생성할 기획안을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedRules(null);
        setFeedback(''); // 피드백 초기화

        try {
            const response = await fetch('http://localhost:8080/api/plans/generate-rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conceptId: parseInt(selectedConceptId, 10) }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '규칙 생성에 실패했습니다.');
            }
            const data = await response.json();
            setGeneratedRules(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // [추가] 규칙 재생성 버튼 클릭 핸들러
    const handleRegenerateRules = async () => {
        if (!generatedRules || !feedback) {
            setError('피드백을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/plans/regenerate-rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ruleId: generatedRules.ruleId,
                    feedback: feedback
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '규칙 재생성에 실패했습니다.');
            }
            const data = await response.json();
            setGeneratedRules(data); // 상태를 새로운 규칙으로 업데이트
            setFeedback(''); // 피드백 초기화
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rule-container">
            <div className="rule-form-section">
                <h2>게임 규칙 설계</h2>
                <p>규칙을 설계할 기획안을 선택하고 AI에게 생성을 요청하세요.</p>

                <form className="rule-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="concept-select">기획안 선택</label>
                        <select
                            id="concept-select"
                            value={selectedConceptId}
                            onChange={(e) => setSelectedConceptId(e.target.value)}
                            required
                        >
                            <option value="" disabled>-- 기획안 선택 --</option>
                            {concepts.map(c => (
                                <option key={c.conceptId} value={c.conceptId}>
                                    ID: {c.conceptId} - {c.theme}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button onClick={handleGenerateRules} disabled={isLoading} className="submit-button">
                        {isLoading ? 'AI 설계 중...' : '게임 규칙 생성하기'}
                    </button>
                </form>

                {/* [추가] 규칙 생성 후 나타나는 재생성 UI */}
                {generatedRules && !isLoading && (
                    <div className="regenerate-section">
                        <h4>규칙 개선하기</h4>
                        <p>생성된 규칙에 대한 피드백을 입력하고 AI에게 개선을 요청하세요.</p>
                        <textarea
                            placeholder="예: 행동이 너무 단순해요. 좀 더 전략적인 선택지를 추가해주세요."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <button onClick={handleRegenerateRules} disabled={!feedback} className="submit-button regenerate-button">
                            피드백 반영하여 재생성
                        </button>
                    </div>
                )}
            </div>

            <div className="rule-result-section">
                {isLoading && <div className="spinner"></div>}
                {error && <div className="error-message">{error}</div>}

                {generatedRules ? (
                    <div className="rule-card">
                        <h3>AI가 설계한 게임 규칙 (Rule ID: {generatedRules.ruleId})</h3>
                        <div className="rule-item"><h4>턴 순서</h4><p>{generatedRules.turnStructure}</p></div>
                        <div className="rule-item"><h4>행동 규칙</h4><ul>{generatedRules.actionRules.map((rule, index) => <li key={index}>{rule}</li>)}</ul></div>
                        <div className="rule-item"><h4>승리 조건</h4><p>{generatedRules.victoryCondition}</p></div>
                        <div className="rule-item"><h4>페널티 규칙</h4><ul>{generatedRules.penaltyRules.map((rule, index) => <li key={index}>{rule}</li>)}</ul></div>
                        <div className="rule-item"><h4>설계 노트</h4><p>{generatedRules.designNote}</p></div>
                    </div>
                ) : (
                    !isLoading && !error && (
                        <div className="initial-state">
                            <p>사용자께서는 먼저 원하는 기획안을 선택해 주시기 바랍니다.
                                기획안을 선택하신 후, '게임 규칙 생성하기' 버튼을 눌러주세요.
                                버튼을 클릭하면 인공지능이 선택된 기획안을 바탕으로 분석을 시작합니다.
                                분석 결과에 따라 해당 기획안에 적합한 게임 규칙이 자동으로 설계됩니다.
                                설계된 게임 규칙은 아래 결과 창에 실시간으로 표시됩니다.
                                이를 통해 사용자께서는 게임의 구체적인 진행 방식과 규칙을 확인하실 수 있습니다.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RuleCreator;
