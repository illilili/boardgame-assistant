import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProjects, getTasksForProject } from '../api/auth';
import './DevelopmentListViewer.css';

// 상태(status)에 따라 다른 스타일을 적용하기 위한 함수
const getStatusClassName = (statusSummary) => {
    switch (statusSummary) {
        case '작업 중':
            return 'status-in-progress';
        case '승인':
            return 'status-completed';
        case '작업 대기':
            return 'status-waiting';
        case '제출 완료':
             return 'status-submitted';
        case '작업 완료':
            return 'status-ready';
        case '반려':
            return 'status-rejected';
        default:
            return '';
    }
};

function DevelopmentListViewer() {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [components, setComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedComponentId, setExpandedComponentId] = useState(null);

    // 컴포넌트 마운트 시 프로젝트 목록 불러오기
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectData = await getMyProjects();
                setProjects(projectData);
                if (projectData.length > 0) {
                    setSelectedProjectId(projectData[0].projectId);
                }
            } catch (err) {
                setError('프로젝트 목록을 불러오는 데 실패했습니다.');
                console.error(err);
            }
        };
        fetchProjects();
    }, []);

    // 프로젝트 선택이 바뀔 때마다 해당 프로젝트의 태스크(컴포넌트) 목록 불러오기
    useEffect(() => {
        if (!selectedProjectId) return;
        
        setExpandedComponentId(null); 
        
        const fetchTasks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const responseData = await getTasksForProject(selectedProjectId);
                setProjectTitle(responseData.projectTitle);
                setComponents(responseData.components || []);
            } catch (err) {
                setError('개발 항목을 불러오는 데 실패했습니다.');
                setComponents([]);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [selectedProjectId]);

    // 하위 태스크 목록을 토글하는 함수
    const toggleSubTasks = (componentId) => {
        if (expandedComponentId === componentId) {
            setExpandedComponentId(null);
        } else {
            setExpandedComponentId(componentId);
        }
    };

    return (
        <div className="component-placeholder">
            <h2>[개발] 개발 목록 조회</h2>
            <p>프로젝트를 선택하여 진행 중인 개발 항목의 목록과 상태를 확인합니다.</p>
            
            <div className="project-selector-container">
                <label htmlFor="project-select">프로젝트 선택:</label>
                <select 
                    id="project-select" 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(e.target.value)}
                    disabled={projects.length === 0}
                >
                    {projects.length > 0 ? (
                        projects.map(p => (
                            <option key={p.projectId} value={p.projectId}>
                                {p.projectName}
                            </option>
                        ))
                    ) : (
                        <option>불러올 프로젝트가 없습니다.</option>
                    )}
                </select>
            </div>

            <div className="dev-list-container">
                <div className="dev-list-header">
                    <span className="header-category">타입</span>
                    <span className="header-task">개발 항목 (구성요소)</span>
                    <span className="header-status">상태</span>
                </div>
                
                {isLoading ? (
                    <div className="message-container">로딩 중...</div>
                ) : error ? (
                    <div className="message-container error">{error}</div>
                ) : components.length > 0 ? (
                    <ul className="dev-list">
                        {components.map(component => (
                            <React.Fragment key={component.componentId}>
                                <li
                                    className="dev-list-item clickable"
                                    onClick={() => toggleSubTasks(component.componentId)}
                                >
                                    <span className="item-category">{component.type}</span>
                                    <div className="item-task-group">
                                        <span className="item-task-name">{component.title}</span>
                                        <span className="item-related-plan">
                                            {component.quantity && `수량: ${component.quantity}`}
                                        </span>
                                        {expandedComponentId === component.componentId && (
                                            <>
                                                {component.roleAndEffect && (
                                                    <p className="item-details"><strong>효과:</strong> {component.roleAndEffect}</p>
                                                )}
                                                {component.artConcept && (
                                                    <p className="item-details"><strong>설명:</strong> {component.artConcept}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <span className="item-status">
                                        <span className={`status-badge ${getStatusClassName(component.statusSummary)}`}>
                                            {component.statusSummary}
                                        </span>
                                    </span>
                                </li>
                                
                                {expandedComponentId === component.componentId && (
                                    <div className="sub-task-container">
                                        <ul className="sub-task-list">
                                            {component.subTasks.length > 0 ? (
                                                component.subTasks.map(subTask => (
                                                    <li key={subTask.contentId} className="sub-task-item">
                                                        {/* 🚨 하위 작업의 구조를 변경합니다. */}
                                                        <span className="sub-task-id">ID: {subTask.contentId}</span>
                                                        <span className="sub-task-status">상태: {subTask.status}</span>
                                                        <Link to={`/generate-card/${subTask.contentId}`} className="sub-task-link">
                                                            작업하기 &rarr;
                                                        </Link>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="sub-task-item no-sub-task">하위 작업이 없습니다.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                ) : (
                    <div className="message-container">표시할 개발 항목이 없습니다.</div>
                )}
            </div>
        </div>
    );
}

export default DevelopmentListViewer;