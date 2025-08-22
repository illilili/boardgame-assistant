// ✨ 1. useRef를 추가로 import 합니다.
import React, { useState, useEffect, useContext, useRef } from 'react';
import './RuleCreator.css';
import { getAllConcepts, generateRule, regenerateRule } from '../api/auth.js';
import { ProjectContext } from '../contexts/ProjectContext';

const RuleCreator = () => {
    const { projectId } = useContext(ProjectContext);

    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');
    
    // ✨ 2. Context에서 상태를 가져오는 대신, 다시 컴포넌트의 로컬 상태로 관리합니다.
    const [generatedRules, setGeneratedRules] = useState(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');

    // ✨ 3. 페이지 첫 로드 시 데이터를 복원했는지 추적하기 위한 ref를 추가합니다.
    const restoredOnLoad = useRef(false);

    // ✨ 4. generatedRules 데이터가 변경될 때마다 sessionStorage에 자동으로 저장합니다.
    useEffect(() => {
        if (generatedRules) {
            sessionStorage.setItem('rc_last_rules', JSON.stringify(generatedRules));
        }
        // generatedRules가 null이 되면 저장된 데이터를 삭제합니다.
        else {
            sessionStorage.removeItem('rc_last_rules');
        }
    }, [generatedRules]);

    // ✨ 5. 페이지에 처음 들어왔을 때 sessionStorage에서 데이터를 불러옵니다.
    useEffect(() => {
        const savedRulesJSON = sessionStorage.getItem('rc_last_rules');
        if (savedRulesJSON) {
            try {
                const savedRules = JSON.parse(savedRulesJSON);
                setGeneratedRules(savedRules);
                restoredOnLoad.current = true; // 데이터를 복원했다고 표시합니다.
            } catch (e) {
                console.error("저장된 규칙을 불러오는 데 실패했습니다:", e);
                sessionStorage.removeItem('rc_last_rules');
            }
        }
    }, []); // 이 코드는 첫 렌더링 시에만 실행됩니다.

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
            // ✨ 6. 이전에 저장된 규칙이 있다면 해당 conceptId를 선택하도록 처리합니다.
            const savedRulesJSON = sessionStorage.getItem('rc_last_rules');
            if (savedRulesJSON) {
                const savedRules = JSON.parse(savedRulesJSON);
                const conceptIdForSavedRules = savedRules?.conceptId;

                // 저장된 conceptId가 현재 프로젝트의 컨셉 목록에 있는지 확인
                if (conceptIdForSavedRules && conceptsForProject.some(c => c.conceptId === conceptIdForSavedRules)) {
                    setSelectedConceptId(conceptIdForSavedRules.toString());
                    return; // 올바른 ID를 설정했으므로 함수 종료
                }
            }
            // 저장된 규칙이 없거나, 다른 프로젝트의 규칙이면 목록의 첫 번째 항목을 선택
            setSelectedConceptId(conceptsForProject[0].conceptId.toString());

        } else {
            setSelectedConceptId('');
        }
    }, [projectId, conceptList]);

    // ✨ 7. selectedConceptId가 변경될 때의 로직을 수정합니다.
    useEffect(() => {
        // 페이지 로드 시 데이터를 복원한 경우에는 아래 초기화 코드를 실행하지 않고 건너뜁니다.
        if (restoredOnLoad.current) {
            restoredOnLoad.current = false; // 플래그를 리셋하여 다음 선택부터는 정상 작동하게 합니다.
            return;
        }

        // 사용자가 드롭다운에서 다른 기획안을 선택했을 때, 이전 규칙 정보를 초기화합니다.
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
        setGeneratedRules(null);
        setFeedback('');

        try {
            const conceptId = parseInt(selectedConceptId, 10);
            const data = await generateRule({ conceptId });
            // 생성된 규칙 데이터에 conceptId를 함께 저장하여 나중에 복원할 때 사용합니다.
            setGeneratedRules({ ...data, conceptId }); 
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
            const conceptId = parseInt(selectedConceptId, 10);
            const requestBody = {
                conceptId,
                ruleId: generatedRules.ruleId,
                feedback: feedback
            };
            const data = await regenerateRule(requestBody);
             // 재생성된 규칙 데이터에도 conceptId를 함께 저장합니다.
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
                ) : (
                    !isLoading && !error && (
                        <div className="initial-states">
                            <p>기획안을 선택하고 '게임 규칙 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RuleCreator;