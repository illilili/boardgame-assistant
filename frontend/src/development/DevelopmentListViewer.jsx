// DevelopmentListViewer.jsx
import React, { useState, useEffect } from 'react';
import './DevelopmentListViewer.css';
import { getTasksForProject } from '../api/auth';

const getStatusClassName = (statusSummary) => {
  switch (statusSummary) {
    case '작업 대기': return 'status-waiting';
    case '작업 중': return 'status-in-progress';
    case '작업 완료': return 'status-ready'; // READY_TO_SUBMIT
    case '제출 완료': return 'status-submitted'; // PENDING_REVIEW
    case '승인': return 'status-completed';
    case '반려': return 'status-rejected';
    default: return '';
  }
};

const getLinkForComponentType = (type) => {
  if (!type) return { supported: false, id: 'file-upload' };
  const lower = type.toLowerCase();
  if (lower.includes('card')) return { supported: true, id: 'card-gen' };
  if (lower.includes('rulebook') || lower.includes('document')) return { supported: true, id: 'rulebook-gen' };
  if (['token', 'pawn', 'miniature', 'figure', 'dice'].some(k => lower.includes(k)))
    return { supported: true, id: 'model-gen' };
  if (lower.includes('thumbnail') || lower.includes('image')) return { supported: true, id: 'thumbnail-gen' };
  return { supported: false, id: 'file-upload' };
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
    setExpandedComponentId(prev => (prev === componentId ? null : componentId));
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
            {components.map(component => (
              <React.Fragment key={component.componentId}>
                <li
                  className="dev-list-item clickable"
                  onClick={() => toggleSubTasks(component.componentId)}
                >
                  <span className="item-category">{component.type}</span>
                  <div className="item-task-group">
                    <span className="item-task-name">{component.title}</span>
                    {component.quantity && (
                      <span className="item-related-plan">수량: {component.quantity}</span>
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
                        component.type.toLowerCase().includes('card') ? (
                          <li className="sub-task-item">
                            <div className="sub-task-info">
                              <span className="sub-task-name">
                                카드 작업&nbsp;
                                {component.subTasks
                                  .filter(st => st.type)
                                  .map(st => `콘텐츠 ID: ${st.contentId} (${st.type})`)
                                  .join(', ')}
                              </span>
                            </div>
                            <div className="sub-task-actions">
                              <button
                                className="sub-task-link"
                                onClick={() => {
                                  const textTask = component.subTasks.find(st => st.type?.toLowerCase().includes('text'));
                                  const imageTask = component.subTasks.find(st => st.type?.toLowerCase().includes('image'));
                                  onNavigate('card-gen', {
                                    textContentId: textTask ? textTask.contentId : null,
                                    imageContentId: imageTask ? imageTask.contentId : null,
                                  });
                                }}
                              >
                                작업하기 →
                              </button>
                            </div>
                          </li>
                        ) : (
                          component.subTasks.map(subTask => {
                            const { supported, id } = getLinkForComponentType(component.type);
                            return (
                              <li key={subTask.contentId || subTask.id} className="sub-task-item">
                                <div className="sub-task-info">
                                  <span className="sub-task-name">
                                    {subTask.name ||
                                      `콘텐츠 ID: ${subTask.contentId} (${subTask.type || 'unknown'})`}
                                  </span>
                                </div>
                                <div className="sub-task-actions">
                                  <button
                                    className="sub-task-link"
                                    onClick={() => onNavigate(id, subTask.contentId)}
                                  >
                                    {supported ? '작업하기 →' : '파일 업로드 →'}
                                  </button>
                                </div>
                              </li>
                            );
                          })
                        )
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
