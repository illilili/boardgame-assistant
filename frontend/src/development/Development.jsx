// Development.js
import React, { useState, useContext } from 'react';
import './Development.css';

import ApprovedPlanViewer from './ApprovedPlanViewer';
import FileUploadPage from './FileUploadPage';
import DevelopmentListViewer from './DevelopmentListViewer';
import RulebookGenerator from './RulebookGenerator';
import ComponentGenerator from './ComponentGenerator';
import ModelGenerator from './ModelGenerator';
import ThumbnailGenerator from './ThumbnailGenerator';
import { ProjectContext } from '../contexts/ProjectContext';
import Header from '../mainPage/Header';

// 시작 화면 컴포넌트
function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">🚀</div>
      <h2>게임 개발을 시작해 보세요</h2>
      <p>
        왼쪽 메뉴에서 원하는 개발 작업을 선택하여 프로젝트를 진행할 수 있습니다.
        각 단계에 맞춰 필요한 콘텐츠를 생성하고 관리해 보세요.
      </p>
      <button className="start-button" onClick={onStart}>
        개발 시작하기
      </button>
    </div>
  );
}

// --- 데이터 및 메인 컴포넌트 ---
const workspaceNavItems = [
  { id: 'approved-plan', title: '승인된 기획안 조회', component: <ApprovedPlanViewer /> },
  { id: 'dev-list', title: '개발 목록 조회', component: <DevelopmentListViewer /> },
  { id: 'card-gen', title: '카드/아이템 생성', component: <ComponentGenerator /> },
  { id: 'rulebook-gen', title: '룰북 초안 생성', component: <RulebookGenerator /> },
  { id: 'model-gen', title: '3D 모델 생성', component: <ModelGenerator /> },
  { id: 'thumbnail-gen', title: '썸네일 이미지 생성', component: <ThumbnailGenerator /> },
  { id: 'file-upload', title: '파일 업로드', component: <FileUploadPage /> },
];

function Development() {
  const { projectId } = useContext(ProjectContext);
  const [activeViewId, setActiveViewId] = useState(() => localStorage.getItem('activeViewId') || null);
  const [selectedContentId, setSelectedContentId] = useState(() => {
    const saved = localStorage.getItem('selectedContentId');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return saved || null;
    }
  });

  const handleNavigate = (viewId, contentId = null) => {
    setActiveViewId(viewId);
    setSelectedContentId(contentId);

    localStorage.setItem('activeViewId', viewId);
    // card-gen이면 {textContentId, imageContentId} 그대로 저장
    localStorage.setItem('selectedContentId', JSON.stringify(contentId ?? ''));
  };

  const activeView = activeViewId
    ? workspaceNavItems.find(item => item.id === activeViewId)
    : null;

  return (
    <>
      <Header projectMode={true} />
      <div className="workspace-container new-design">
        <aside className="workspace-sidebar">
          <div className="sidebar-header">
            <div className="logo">Dev</div>
            {projectId && <div className="project-id">Project ID: {projectId}</div>}
          </div>
          <ul className="workspace-nav-list">
            {workspaceNavItems.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${activeViewId === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </aside>

        <main className="workspace-main-content">
          {activeViewId === 'dev-list' ? (
            <DevelopmentListViewer onNavigate={handleNavigate} projectId={projectId} />
          ) : activeView ? (
            activeViewId === 'card-gen'
              ? React.cloneElement(activeView.component, {
                textContentId: selectedContentId?.textContentId,
                imageContentId: selectedContentId?.imageContentId,
                projectId,
              })
              : React.cloneElement(activeView.component, { contentId: selectedContentId, projectId })
          ) : (
            <WelcomeScreen onStart={() => handleNavigate('approved-plan')} />
          )}
        </main>
      </div>
    </>
  );
}

export default Development;
