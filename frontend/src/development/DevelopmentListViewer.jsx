// DevelopmentListViewer.js
import React, { useState, useEffect } from 'react';
import './DevelopmentListViewer.css';
import { getTasksForProject } from '../api/auth';

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
  if (!type) return { supported: false, id: 'content-submit' };

  const lowerCaseType = type.toLowerCase();

  if (lowerCaseType.includes('card')) {
    return { supported: true, id: 'card-gen' };
  } else if (lowerCaseType.includes('rulebook') || lowerCaseType.includes('document')) {
    return { supported: true, id: 'rulebook-gen' };
  } else if (
    lowerCaseType.includes('token') ||
    lowerCaseType.includes('pawn') ||
    lowerCaseType.includes('miniature') ||
    lowerCaseType.includes('figure') ||
    lowerCaseType.includes('dice')
  ) {
    return { supported: true, id: 'model-gen' };
  } else if (lowerCaseType.includes('thumbnail') || lowerCaseType.includes('image')) {
    return { supported: true, id: 'thumbnail-gen' };
  } else {
    return { supported: false, id: 'content-submit' };
  }
};

function DevelopmentListViewer({ onNavigate, projectId }) {
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedComponentId, setExpandedComponentId] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    setExpandedComponentId(null);

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const responseData = await getTasksForProject(projectId);
        setComponents(responseData.components || []);
      } catch (err) {
        setError('개발 항목을 불러오는 데 실패했습니다.');
        setComponents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const toggleSubTasks = (componentId) => {
    setExpandedComponentId(prevId => (prevId === componentId ? null : componentId));
  };

  return (
    <div className="component-placeholder">
      <h2>[개발] 개발 목록 조회</h2>
      <p>현재 프로젝트의 개발 항목과 상태를 확인합니다.</p>

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
            {components.map(component => {
              return (
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
                        <div className="item-details-wrapper">
                          {component.roleAndEffect && <p className="item-details"><strong>효과:</strong> {component.roleAndEffect}</p>}
                          {component.artConcept && <p className="item-details"><strong>설명:</strong> {component.artConcept}</p>}
                        </div>
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
                          component.subTasks.map(subTask => {
                            const { supported, id } = getLinkForComponentType(component.type);
                            return (
                              <li key={subTask.contentId || subTask.id} className="sub-task-item">
                                <div className="sub-task-info">
                                  <span className="sub-task-name">
                                    {subTask.name || `콘텐츠 ID: ${subTask.contentId}`}
                                  </span>
                                  {subTask.effect && <p className="sub-task-effect">{subTask.effect}</p>}
                                </div>
                                <div className="sub-task-actions">
                                  <span className="sub-task-status">상태: {subTask.status}</span>
                                  {subTask.contentId ? (
                                    <button
                                      className="sub-task-link"
                                      onClick={() => onNavigate(id, subTask.contentId)}
                                    >
                                      {supported ? '작업하기 →' : '파일 업로드'}
                                    </button>
                                  ) : (
                                    <span className="sub-task-link disabled">ID 없음</span>
                                  )}
                                </div>
                              </li>
                            );
                          })
                        ) : (
                          <li className="sub-task-item no-sub-task">하위 작업이 없습니다.</li>
                        )}
                      </ul>
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
