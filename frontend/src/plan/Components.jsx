// 파일: src/components/Components.js

import React, { useState, useEffect } from 'react';
import './Components.css'; 
import { getMyProjects, getAllConcepts, generateComponents, regenerateComponents } from '../api/auth.js';

const Components = () => {
    const [projectList, setProjectList] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [componentsData, setComponentsData] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

    // 모든 컨셉 목록을 불러오는 useEffect
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


    // 규칙 생성 핸들러
    const handleGenerateComponents = async (e) => {
        e.preventDefault();
        if (!selectedConceptId) {
            setError('먼저 기획안을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setComponentsData(null);
        setFeedback('');

        try {
            const data = await generateComponents({ conceptId: parseInt(selectedConceptId, 10) });
            setComponentsData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 규칙 재생성 핸들러
    const handleRegenerate = async (e) => {
        e.preventDefault();
        if (!selectedConceptId) {
            setError('기획안이 선택되지 않았습니다.');
            return;
        }
        if (!feedback.trim()) {
            setError('피드백을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const requestBody = {
                conceptId: parseInt(selectedConceptId),
                feedback: feedback
            };
            const data = await regenerateComponents(requestBody);
            setComponentsData(data);
            setFeedback('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="components-container">
            <div className="components-form-section">
                <h2>게임 구성요소 설계</h2>
                <p>구성요소를 설계할 기획안을 선택하고 AI에게 생성을 요청하세요.</p>
                
                <form className="components-form" onSubmit={handleGenerateComponents}>
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
                    
                    <button type="submit" disabled={isLoading || !selectedConceptId} className="submit-button">
                        {isLoading ? 'AI 설계 중...' : '구성요소 생성하기'}
                    </button>
                </form>

                {componentsData && !isLoading && (
                    <div className="regeneration-form-section">
                        <h4>피드백으로 개선하기</h4>
                        <p>AI가 생성한 구성요소가 마음에 들지 않으신가요? 아래에 피드백을 남겨 AI가 더 나은 결과물을 만들도록 해보세요.</p>
                        <form onSubmit={handleRegenerate}>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="예시) 카드의 종류가 너무 적어요. 전략적인 아이템 카드를 추가해주세요."
                                rows="4"
                                required
                            ></textarea>
                            <button type="submit" disabled={isLoading || !feedback.trim()} className="regenerate-button">
                                {isLoading ? 'AI 재설계 중...' : '피드백으로 재생성하기'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="components-result-section">
                {isLoading && <div className="spinner"></div>}
                {error && <div className="error-message">{error}</div>}
                
                {componentsData ? (
                    <div className="components-card">
                        <h3>AI가 설계한 게임 구성요소</h3>
                        <div className="components-list">
                            {Array.isArray(componentsData.component) && componentsData.component.map((item) => (
                                <div key={item.componentId} className="component-item">
                                    <div className="item-header">
                                        <span className="item-type-tag">{item.type}</span>
                                        <strong className="item-name">{item.title}</strong>
                                        {item.quantity && <span className="item-quantity">({item.quantity})</span>}
                                    </div>
                                    <p className="item-detail"><strong>역할 및 효과:</strong> {item.roleAndEffect}</p>
                                    <p className="item-detail"><strong>아트 컨셉:</strong> {item.artConcept}</p>
                                    <p className="item-detail"><strong>상호작용:</strong> {item.interconnection}</p>
                                    
                                    <div className="subtask-section">
                                        <strong>세부 제작 작업:</strong>
                                        <ul className="subtask-list">
                                            {Array.isArray(item.subTasks) && item.subTasks.map(task => (
                                                <li key={task.contentId} className={`status-${task.status.toLowerCase()}`}>
                                                    {task.type} ({task.status})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    !isLoading && !error && (
                        <div className="initial-state">
                            <p>기획안을 선택하고 '구성요소 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Components;