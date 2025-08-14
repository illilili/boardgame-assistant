import React, { useState, useEffect, useContext } from 'react';
import './RuleCreator.css';
import { getAllConcepts, generateRule, regenerateRule } from '../api/auth.js';
import { ProjectContext } from '../contexts/ProjectContext';

const RuleCreator = () => {
    const { projectId } = useContext(ProjectContext);

    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [generatedRules, setGeneratedRules] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchAllConcepts = async () => {
            try {
                const data = await getAllConcepts();
                setConceptList(data);
            } catch (err) {
                setError(err.message || '컨셉 목록 로딩 실패');
            }
        };
        fetchAllConcepts();
    }, []);

    useEffect(() => {
        if (!projectId || conceptList.length === 0) {
            setFilteredConceptList([]);
            setSelectedConceptId('');
            return;
        }
        
        const conceptsForProject = conceptList.filter(c => c.projectId === parseInt(projectId));
        setFilteredConceptList(conceptsForProject.sort((a, b) => b.conceptId - a.conceptId));
        if (conceptsForProject.length > 0) {
            setSelectedConceptId(conceptsForProject[0].conceptId.toString());
        } else {
            setSelectedConceptId('');
        }
    }, [projectId, conceptList]);

    const handleGenerateRules = async () => {
        if (!selectedConceptId) {
            setError('먼저 규칙을 생성할 기획안을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedRules(null);
        setFeedback('');

        try {
            const data = await generateRule({ conceptId: parseInt(selectedConceptId, 10) });
            setGeneratedRules(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateRules = async () => {
        if (!generatedRules || !feedback) {
            setError('피드백을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const requestBody = {
                conceptId: parseInt(selectedConceptId, 10),
                ruleId: generatedRules.ruleId,
                feedback: feedback
            };
            const data = await regenerateRule(requestBody);
            setGeneratedRules(data);
            setFeedback('');
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
                            {filteredConceptList.map(c => (
                                <option key={c.conceptId} value={c.conceptId}>
                                    ID: {c.conceptId} - {c.theme}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button onClick={handleGenerateRules} disabled={isLoading || !selectedConceptId} className="submit-button">
                        {isLoading ? 'AI 설계 중...' : '게임 규칙 생성하기'}
                    </button>
                </form>

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
                            <p>기획안을 선택하고 '게임 규칙 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RuleCreator;
