import React, { useState, useEffect } from 'react';
import './Goal.css'; 
import { getMyProjects, getAllConcepts, generateGoal } from '../api/auth'; 

const Goal = () => {
    const [projectList, setProjectList] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [objective, setObjective] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 프로젝트 목록을 불러오는 useEffect
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getMyProjects();
                setProjectList(data);
                if (data.length > 0) {
                    setSelectedProjectId(data[0].projectId.toString());
                }
            } catch (err) {
                console.error(err);
                setError('프로젝트 목록을 불러올 수 없습니다. 로그인이 유효한지 확인해주세요.');
            }
        };
        fetchProjects();
    }, []);

    // 모든 컨셉 목록을 불러오는 새로운 useEffect
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

    // 선택된 프로젝트에 따라 컨셉 목록을 필터링하는 useEffect
    useEffect(() => {
        if (!selectedProjectId || conceptList.length === 0) {
            setFilteredConceptList([]);
            setSelectedConceptId('');
            return;
        }
        
        const conceptsForProject = conceptList.filter(c => c.projectId === parseInt(selectedProjectId));
        setFilteredConceptList(conceptsForProject.sort((a, b) => b.conceptId - a.conceptId));
        if (conceptsForProject.length > 0) {
            setSelectedConceptId(conceptsForProject[0].conceptId.toString());
        } else {
            setSelectedConceptId('');
        }
    }, [selectedProjectId, conceptList]);

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
                        <label htmlFor="project-select">프로젝트 선택</label>
                        <select
                            id="project-select"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            required
                        >
                            {projectList.length > 0 ? (
                                projectList.map((project) => (
                                    <option key={project.projectId} value={project.projectId}>
                                        {project.projectName}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>프로젝트를 먼저 생성해주세요.</option>
                            )}
                        </select>
                    </div>
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
                            <ul>
                                {objective.subGoals.map((goal, index) => (
                                    <li key={index}>{goal}</li>
                                ))}
                            </ul>
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