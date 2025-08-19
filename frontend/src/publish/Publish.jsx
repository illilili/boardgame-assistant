import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Publish.css';
import { ProjectContext } from '../contexts/ProjectContext';

import Header from '../mainPage/Header';

// ✅ 개발 파트에서 쓰던 승인된 기획안 뷰어 재사용
import ApprovedPlanViewer from '../development/ApprovedPlanViewer';
import TranslationWrapper from './TranslationWrapper';
import PricingEvaluation from './PricingEvaluation';

// 사이드바 메뉴 정의
const workspaceNavItems = [
  { id: 'approved-plan', title: '승인된 기획안 조회', component: <ApprovedPlanViewer /> },
  { id: 'translation', title: '번역', component: <TranslationWrapper /> },
  { id: 'pricing', title: '가격 책정', component: <PricingEvaluation /> },
];

function Publish() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeViewId, setActiveViewId] = useState('approved-plan'); // ✅ 기본 탭은 승인된 기획안 조회

  const activeView = activeViewId
    ? workspaceNavItems.find((item) => item.id === activeViewId)
    : null;

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

  return (
    <>
      <Header projectMode={true} />
      <ProjectContext.Provider value={{ projectId }}>
        <div className="workspace-container new-design">
          <aside className="workspace-sidebar">
            <div className="sidebar-header">
              {/* 프로젝트 홈 이동 */}
              <div
                className="logo"
                onClick={() => navigate(`/projects/${projectId}`)}
                style={{ cursor: 'pointer' }}
                title="프로젝트 홈으로"
              >
                PUBLISH
              </div>
              <div className="project-info">
              </div>
            </div>

            <ul className="workspace-nav-list">
              {workspaceNavItems.map((item) => (
                <li
                  key={item.id}
                  className={`nav-item ${activeViewId === item.id ? 'active' : ''}`}
                  onClick={() => setActiveViewId(item.id)}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </aside>

          <main className="workspace-main-content">
            {activeView ? (
              activeView.component
            ) : (
              <div className="welcome-screen">
                <span className="welcome-icon">👋</span>
                <h2>환영합니다!</h2>
                <p>왼쪽 메뉴에서 작업을 선택하여 시작해주세요.</p>
                <p>현재 프로젝트 ID: {projectId}</p>
              </div>
            )}
          </main>
        </div>
      </ProjectContext.Provider>
    </>
  );
}

export default Publish;
