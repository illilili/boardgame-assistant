import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProjects, getTasksForProject } from '../api/auth';
import './DevelopmentListViewer.css';

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

const getLinkForComponentType = (type) => {
    if (!type) return '/content-view';
    const lowerCaseType = type.toLowerCase();

    if (lowerCaseType.includes('card')) {
        return '/card-gen';
    } else if (lowerCaseType.includes('rulebook')) {
        return '/rulebook-gen';
    } else if (lowerCaseType.includes('script')) {
        return '/script-gen';
    } else if (lowerCaseType.includes('token') || lowerCaseType.includes('pawn') || lowerCaseType.includes('miniature') || lowerCaseType.includes('figure') || lowerCaseType.includes('dice')) {
        return '/model-gen';
    } else if (lowerCaseType.includes('box') || lowerCaseType.includes('board') || lowerCaseType.includes('mat')) {
        return '/thumbnail-gen';
    } else {
        return '/content-view';
    }
};

function DevelopmentListViewer() {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [components, setComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedComponentId, setExpandedComponentId] = useState(null);

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
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (!selectedProjectId) return;
        
        setExpandedComponentId(null);
        
        const fetchTasks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const responseData = await getTasksForProject(selectedProjectId);
                setComponents(responseData.components || []);
            } catch (err) {
                setError('개발 항목을 불러오는 데 실패했습니다.');
                setComponents([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [selectedProjectId]);
    
    const toggleSubTasks = (componentId) => {
        setExpandedComponentId(prevId => (prevId === componentId ? null : componentId));
    };

    return (
        <div className="dev-viewer-container">
            <header className="dev-viewer-header">
                <h2>[개발] 개발 목록 조회</h2>
                <p>프로젝트를 선택하여 진행 중인 개발 항목의 목록과 상태를 확인합니다.</p>
            </header>
            
            <div className="project-selector-container">
                <label htmlFor="project-select">프로젝트 선택:</label>
                <select 
                    id="project-select" 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(e.target.value)}
                    disabled={projects.length === 0}
                >
                    {projects.map(p => (
                        <option key={p.projectId} value={p.projectId}>
                            {p.projectName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="dev-list-wrapper">
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
                        {components.map(component => {
                            const isExpanded = expandedComponentId === component.componentId;
                            return (
                                <React.Fragment key={component.componentId}>
                                    <li
                                        className={`dev-list-item clickable ${isExpanded ? 'expanded' : ''}`}
                                        onClick={() => toggleSubTasks(component.componentId)}
                                    >
                                        <span className="item-category">{component.type}</span>
                                        <div className="item-task-group">
                                            <span className="item-task-name">{component.title}</span>
                                            {component.quantity && (
                                                <span className="item-related-plan">
                                                    수량: {component.quantity}
                                                </span>
                                            )}
                                        </div>
                                        <span className="item-status">
                                            <span className={`status-badge ${getStatusClassName(component.statusSummary)}`}>
                                                {component.statusSummary}
                                            </span>
                                        </span>
                                    </li>
                                    
                                    {isExpanded && (
                                        <div className="sub-task-details-wrapper">
                                            {component.roleAndEffect && <p className="item-details"><strong>효과:</strong> {component.roleAndEffect}</p>}
                                            {component.artConcept && <p className="item-details"><strong>설명:</strong> {component.artConcept}</p>}
                                            
                                            {component.subTasks && component.subTasks.length > 0 && (
                                                <div className="sub-task-container">
                                                    <ul className="sub-task-list">
                                                        {component.subTasks.map((subTask, subIndex) => (
                                                            <li key={`${component.componentId}-${subIndex}`} className="sub-task-item">
                                                                <div className="sub-task-info">
                                                                    <span className="sub-task-name">{subTask.name || `콘텐츠 ID: ${subTask.contentId}`}</span>
                                                                    {subTask.effect && <p className="sub-task-effect">{subTask.effect}</p>}
                                                                </div>
                                                                <div className="sub-task-actions">
                                                                    <span className="sub-task-status">상태: {subTask.status}</span>
                                                                    {subTask.contentId ? (
                                                                        <Link to={`${getLinkForComponentType(component.type)}/${subTask.contentId}`} className="sub-task-link">
                                                                            작업하기 →
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="sub-task-link disabled">ID 없음</span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="message-container">표시할 개발 항목이 없습니다.</div>
                )}
            </div>
        </div>
    );
}

export default DevelopmentListViewer;