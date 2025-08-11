import React, { useState, useEffect } from 'react';
import { getMyProjects, getTasksForProject } from '../api/auth'; // API 함수는 그대로 사용
import './DevelopmentListViewer.css';

// 상태(status)에 따라 다른 스타일을 적용하기 위한 함수
const getStatusClassName = (statusSummary) => {
    // 🚨 TaskService의 calculateStatusSummary와 매핑
    switch (statusSummary) {
        case '작업 중':
            return 'status-in-progress';
        case '승인':
            return 'status-completed';
        case '작업 대기':
            return 'status-waiting';
        case '제출 완료': // '제출 완료 (승인 대기)'
             return 'status-submitted';
        case '작업 완료': // '작업 완료 (제출 대기)'
            return 'status-ready';
        case '반려':
            return 'status-rejected';
        default:
            return '';
    }
};

function DevelopmentListViewer() {
    // --- 상태 관리 ---
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    
    // 🚨 API 응답에 맞춰 상태 이름 변경 및 추가
    const [projectTitle, setProjectTitle] = useState('');
    const [components, setComponents] = useState([]); // 'tasks' -> 'components'로 변경
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- 데이터 로딩 ---
    // 1. 컴포넌트 마운트 시 프로젝트 목록 불러오기
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

    // 2. 프로젝트 선택이 바뀔 때마다 해당 프로젝트의 태스크(컴포넌트) 목록 불러오기
    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchTasks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 🚨 API 응답 전체를 받음
                const responseData = await getTasksForProject(selectedProjectId);
                // 🚨 실제 데이터 구조에 맞춰 상태 업데이트
                setProjectTitle(responseData.projectTitle);
                setComponents(responseData.components || []); // components가 없을 경우 빈 배열로 처리
            } catch (err) {
                setError('개발 항목을 불러오는 데 실패했습니다.');
                setComponents([]); // 에러 발생 시 목록 비우기
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [selectedProjectId]);

    // --- 렌더링 ---
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
                    {/* 🚨 담당자, 마감일 제거 */}
                    <span className="header-status">상태</span>
                </div>
                
                {isLoading ? (
                    <div className="message-container">로딩 중...</div>
                ) : error ? (
                    <div className="message-container error">{error}</div>
                ) : components.length > 0 ? (
                    <ul className="dev-list">
                        {/* 🚨 components 배열을 순회하며 렌더링 */}
                        {components.map(component => (
                            <li key={component.componentId} className="dev-list-item">
                                <span className="item-category">{component.type}</span>
                                <div className="item-task-group">
                                    <span className="item-task-name">{component.title}</span>
                                    {/* 🚨 프로젝트 제목은 상단에 한 번만 표시되므로 개별 항목에서는 생략 */}
                                    <span className="item-related-plan">
                                        {component.quantity && `수량: ${component.quantity}`}
                                    </span>
                                </div>
                                {/* 🚨 담당자, 마감일 제거 */}
                                <span className="item-status">
                                    <span className={`status-badge ${getStatusClassName(component.statusSummary)}`}>
                                        {component.statusSummary}
                                    </span>
                                </span>
                            </li>
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