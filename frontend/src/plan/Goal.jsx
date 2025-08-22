// 1. React에서 useRef를 추가로 import 합니다.
import React, { useState, useEffect, useContext, useRef } from 'react';
import './Goal.css';
import { getAllConcepts, generateGoal } from '../api/auth';
import { ProjectContext } from '../contexts/ProjectContext';

const Goal = () => {
    const { projectId } = useContext(ProjectContext);

    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [objective, setObjective] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. 페이지 첫 로드 시 데이터를 복원했는지 추적하기 위한 ref를 추가합니다.
    const restoredOnLoad = useRef(false);

    // 3. (새로 추가) 페이지에 처음 들어왔을 때 sessionStorage에서 데이터를 불러옵니다.
    useEffect(() => {
        const savedResultJSON = sessionStorage.getItem('goal_last_result');
        if (savedResultJSON) {
            try {
                const savedResult = JSON.parse(savedResultJSON);
                setObjective(savedResult.objective);
                setSelectedConceptId(savedResult.selectedConceptId);
                restoredOnLoad.current = true; // 데이터를 복원했다고 표시합니다.
            } catch (e) {
                console.error("저장된 목표를 불러오는 데 실패했습니다:", e);
                sessionStorage.removeItem('goal_last_result');
            }
        }
    }, []); // []는 이 코드가 단 한 번, 첫 렌더링 시에만 실행되게 합니다.

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

    // 4. 기존 useEffect를 수정하여, 복원된 선택값을 덮어쓰지 않도록 합니다.
    useEffect(() => {
        // 페이지 첫 로드 시 데이터를 복원했다면, 이 로직을 건너뛰어 선택된 컨셉 ID를 유지합니다.
        if (restoredOnLoad.current) {
            restoredOnLoad.current = false; // 플래그를 리셋하여 다음 projectId 변경 시에는 정상 작동하게 합니다.
            return;
        }

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

    // 5. handleSubmit 함수를 수정하여, 성공 시 sessionStorage에 결과를 저장합니다.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConceptId) {
            setError('먼저 컨셉을 선택해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        setObjective(null);
        try {
            const data = await generateGoal({ conceptId: parseInt(selectedConceptId) });
            setObjective(data);

            // --- ▼ 여기에 저장 로직 추가 ▼ ---
            const resultToSave = {
                objective: data,
                selectedConceptId: selectedConceptId
            };
            sessionStorage.setItem('goal_last_result', JSON.stringify(resultToSave));
            // --- ▲ 여기까지 추가 ▲ ---

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // JSX 부분은 변경할 필요 없습니다.
        <div className="goal__container">
            <div className="goal__form-section">
                <h2>게임 목표 설계</h2>
                <p>게임 목표를 설계할 보드게임 컨셉을 선택하고 버튼을 눌러주세요.</p>
                <form onSubmit={handleSubmit} className="goal__form">
                    <div className="goal__form-group">
                        <label htmlFor="concept-select">컨셉 선택</label>
                        <select
                            id="concept-select"
                            value={selectedConceptId}
                            onChange={(e) => setSelectedConceptId(e.target.value)}
                            required
                        >
                            <option value="" disabled>-- 컨셉을 선택하세요 --</option>
                            {filteredConceptList.map(c => (
                                <option key={c.conceptId} value={c.conceptId}>
                                    ID: {c.conceptId} - {c.theme}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={loading || !selectedConceptId} className="goal__submit-button">
                        {loading ? 'AI 설계 중...' : '게임 목표 생성하기'}
                    </button>
                </form>
            </div>
            <div className="goal__result-section">
                {loading && <div className="goal__spinner"></div>}
                {error && <div className="goal__error-message">{error}</div>}
                {objective && (
                    <div className="goal__objective-card">
                        <h3>설계된 게임 목표</h3>
                        <div className="goal__objective-item">
                            <h4>주요 목표 (Main Goal)</h4>
                            <p>{objective.mainGoal}</p>
                        </div>
                        <div className="goal__objective-item">
                            <h4>보조 목표 (Sub Goals)</h4>
                            <ul>{objective.subGoals.map((goal, index) => <li key={index}>{goal}</li>)}</ul>
                        </div>
                        <div className="goal__objective-item">
                            <h4>승리 조건 타입</h4>
                            <p>{objective.winConditionType}</p>
                        </div>
                        <div className="goal__objective-item">
                            <h4>설계 노트</h4>
                            <p>{objective.designNote}</p>
                        </div>
                    </div>
                )}
                {!loading && !objective && !error && (
                    <div className="goal__initial-state">
                        <p>컨셉을 선택하고 '게임 목표 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Goal;