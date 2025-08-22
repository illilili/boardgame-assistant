import React, { useState, useEffect, useContext, useRef } from 'react';
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
    const restoredOnLoad = useRef(false);

    useEffect(() => {
        if (generatedRules) {
            sessionStorage.setItem('rc_last_rules', JSON.stringify(generatedRules));
        } else {
            sessionStorage.removeItem('rc_last_rules');
        }
    }, [generatedRules]);

    useEffect(() => {
        const savedRulesJSON = sessionStorage.getItem('rc_last_rules');
        if (savedRulesJSON) {
            try {
                const savedRules = JSON.parse(savedRulesJSON);
                setGeneratedRules(savedRules);
                restoredOnLoad.current = true;
            } catch (e) {
                console.error("저장된 규칙을 불러오는 데 실패했습니다:", e);
                sessionStorage.removeItem('rc_last_rules');
            }
        }
    }, []);

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

    // ✨ 수정된 최종 useEffect 로직
    useEffect(() => {
        if (!projectId || conceptList.length === 0) {
            setFilteredConceptList([]);
            setSelectedConceptId('');
            return;
        }
        
        const conceptsForProject = conceptList.filter(c => c.projectId === parseInt(projectId));
        setFilteredConceptList(conceptsForProject.sort((a, b) => b.conceptId - a.conceptId));
        
        if (conceptsForProject.length > 0) {
            if (generatedRules?.conceptId && conceptsForProject.some(c => c.conceptId === generatedRules.conceptId)) {
                setSelectedConceptId(generatedRules.conceptId.toString());
            } else {
                setSelectedConceptId(conceptsForProject[0].conceptId.toString());
            }
        } else {
            setSelectedConceptId('');
        }
    }, [projectId, conceptList, generatedRules]); // ✨ 의존성 배열 수정됨

    useEffect(() => {
        if (restoredOnLoad.current) {
            restoredOnLoad.current = false;
            return;
        }
        setGeneratedRules(null);
        setError('');
    }, [selectedConceptId]);

    const handleGenerateRules = async () => {
        if (!selectedConceptId) {
            setError('먼저 규칙을 생성할 기획안을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        try {
            const conceptId = parseInt(selectedConceptId, 10);
            const data = await generateRule({ conceptId });
            setGeneratedRules({ ...data, conceptId }); 
        } catch (err) {
            setError(err.message);
            setGeneratedRules(null);
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
            const conceptId = parseInt(selectedConceptId, 10);
            const requestBody = {
                conceptId,
                ruleId: generatedRules.ruleId,
                feedback: feedback
            };
            const data = await regenerateRule(requestBody);
            setGeneratedRules({ ...data, conceptId });
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
                        <button onClick={handleRegenerateRules} disabled={isLoading || !feedback} className="submit-button regenerate-button">
                            {isLoading ? 'AI 반영 중...' : '피드백 반영하여 재생성'}
                        </button>
                    </div>
                )}
            </div>

            <div className="rule-result-section">
                {isLoading && (
                    <div className="rule-creator__loading-state">
                        <div className="rule-creator__spinner"></div>
                        <p>AI가 게임 규칙을 설계하고 있습니다...</p>
                    </div>
                )}

                {!isLoading && error && <div className="error-message">{error}</div>}

                {!isLoading && generatedRules && (
                    <div className="rule-card">
                        <h3>AI가 설계한 게임 규칙</h3>
                        <div className="rule-item">
                            <h4>턴 순서</h4>
                            <div className="turn-structure-list">
                                {generatedRules.turnStructure.split(/\s(?=\d\.)/).map((part, index) => (
                                    <div key={index} className="turn-structure-item">
                                        <span className="turn-number">{part.substring(0, 2)}</span>
                                        <span className="turn-description">{part.substring(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rule-item"><h4>행동 규칙</h4><ul>{generatedRules.actionRules.map((rule, index) => <li key={index}>{rule}</li>)}</ul></div>
                        <div className="rule-item"><h4>승리 조건</h4><p>{generatedRules.victoryCondition}</p></div>
                        <div className="rule-item"><h4>페널티 규칙</h4><ul>{generatedRules.penaltyRules.map((rule, index) => <li key={index}>{rule}</li>)}</ul></div>
                        <div className="rule-item"><h4>설계 노트</h4><p>{generatedRules.designNote}</p></div>
                    </div>
                )}
                
                {!isLoading && !generatedRules && !error && (
                    <div className="rule-creator__initial-state">
                        <p>기획안을 선택하고 '게임 규칙 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RuleCreator;