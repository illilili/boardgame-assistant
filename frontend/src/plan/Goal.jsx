import React, { useState, useEffect, useContext } from 'react';
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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="goal-container">
            <div className="goal-form-section">
                <h2>게임 목표 설계</h2>
                <p>게임 목표를 설계할 보드게임 컨셉을 선택하고 버튼을 눌러주세요.</p>
                <form onSubmit={handleSubmit} className="goal-form">
                    <div className="form-group">
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
                    <button type="submit" disabled={loading || !selectedConceptId} className="submit-button">
                        {loading ? 'AI 설계 중...' : '게임 목표 생성하기'}
                    </button>
                </form>
            </div>
            <div className="goal-result-section">
                {loading && <div className="spinner"></div>}
                {error && <div className="error-message">{error}</div>}
                {objective && (
                    <div className="objective-card">
                        <h3>설계된 게임 목표</h3>
                        <div className="objective-item">
                            <h4>주요 목표 (Main Goal)</h4>
                            <p>{objective.mainGoal}</p>
                        </div>
                        <div className="objective-item">
                            <h4>보조 목표 (Sub Goals)</h4>
                            <ul>{objective.subGoals.map((goal, index) => <li key={index}>{goal}</li>)}</ul>
                        </div>
                        <div className="objective-item">
                            <h4>승리 조건 타입</h4>
                            <p>{objective.winConditionType}</p>
                        </div>
                        <div className="objective-item">
                            <h4>설계 노트</h4>
                            <p>{objective.designNote}</p>
                        </div>
                    </div>
                )}
                {!loading && !objective && !error && (
                    <div className="initial-state">
                        <p>컨셉을 선택하고 '게임 목표 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Goal;
