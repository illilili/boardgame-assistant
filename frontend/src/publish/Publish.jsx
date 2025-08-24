// 파일: src/publish/Publish.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Publish.css';
import { ProjectContext } from '../contexts/ProjectContext';

import Header from '../mainPage/Header';

import PricingEvaluation from './PricingEvaluation';
import TranslationList from './TranslationList';
import Translation from './Translation';

// 사이드바 메뉴 정의
const workspaceNavItems = [
  { id: 'translation-list', title: '번역 대기 목록' },
  { id: 'translation', title: '번역' },
  { id: 'pricing', title: '가격 책정' },
];

function Publish() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [activeViewId, setActiveViewId] = useState(
    () => localStorage.getItem('pubActiveViewId') || 'translation-list'
  );
  const [selectedContentId, setSelectedContentId] = useState(null);

  if (!projectId) {
    return (
      <>
        <Header projectMode={true} />
        <div className="workspace-container new-design">
          <main className="workspace-main-content">
            <div className="welcome-screen">
              <span className="welcome-icon">⚠️</span>
              <h2>프로젝트 컨텍스트 오류</h2>
              <p>프로젝트 정보를 찾을 수 없습니다.</p>
              <p>프로젝트 목록에서 프로젝트를 선택한 후 다시 시도해주세요.</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  const handleNavigate = (viewId, payload = null) => {
    setActiveViewId(viewId);
    if (payload) setSelectedContentId(payload); // ✅ 번역 상세로 넘길 콘텐츠 ID 저장
    localStorage.setItem('pubActiveViewId', viewId);
  };

  // 현재 보여줄 뷰 선택
  let activeView = null;
  if (activeViewId === 'translation-list') {
    activeView = (
      <TranslationList onSelectContent={(cid) => handleNavigate('translation', cid)} />
    );
  } else if (activeViewId === 'translation') {
    activeView = <Translation contentId={selectedContentId} />;
  } else if (activeViewId === 'pricing') {
    activeView = <PricingEvaluation />;
  }

  return (
    <div className="publish-page">
      <Header projectMode={true} />
      <ProjectContext.Provider value={{ projectId }}>
        <div className="workspace-container new-design">
          <aside className="pub-workspace-sidebar">
            <div className="sidebar-header">
              {/* 프로젝트 홈 이동 */}
              <div
                className="pub-logo"
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                PUBLISH
              </div>
            </div>

            <ul className="workspace-nav-list">
              {workspaceNavItems.map((item) => (
                <li
                  key={item.id}
                  className={`pub-nav-item ${activeViewId === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.id)}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </aside>

          <main className="workspace-main-content">
            {activeView || (
              <div className="welcome-screen">
                <span className="welcome-icon">🚀</span>
                <h2>퍼블리싱 작업을 시작해 보세요</h2>
                <p>왼쪽 메뉴에서 번역 대기 목록, 번역, 가격 책정을 선택하여 시작할 수 있습니다.</p>
                <p>현재 프로젝트 ID: {projectId}</p>
              </div>
            )}
          </main>
        </div>
      </ProjectContext.Provider>
    </div>
  );
}

export default Publish;
