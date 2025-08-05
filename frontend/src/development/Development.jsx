// Development.js
import React, { useState } from 'react';
import './Development.css';

import ApprovedPlanViewer from './ApprovedPlanViewer';
import ContentSubmitter from './ContentSubmitter';
import DevelopmentListViewer from './DevelopmentListViewer';
import RulebookGenerator from './RulebookGenerator';
import ComponentGenerator from './ComponentGenerator';
import ModelGenerator from './ModelGenerator';
import ThumbnailGenerator from './ThumbnailGenerator';
import ContentViewer from './ContentViewer';
import CopyrightChecker from './CopyrightChecker';
import ScriptGenerator from './ScriptGenerator';
// --- 각 기능별 컴포넌트 Import ---
// 각 기능은 별도의 파일로 만들어 관리하는 것이 좋습니다.
// 우선은 이 파일 내에서 간단한 형태로 정의하겠습니다.




// 시작 화면 컴포넌트
function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">🚀</div>
      <h2>게임 개발을 시작해 보세요</h2>
      <p>왼쪽 메뉴에서 원하는 개발 작업을 선택하여 프로젝트를 진행할 수 있습니다. 각 단계에 맞춰 필요한 콘텐츠를 생성하고 관리해 보세요.</p>
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
    { id: 'rulebook-gen', title: '룰북 초안 생성', component: <RulebookGenerator /> },
    { id: 'script-gen', title: '설명 스크립트 자동생성', component: <ScriptGenerator />},
    { id: 'card-gen', title: '카드/아이템 생성', component: <ComponentGenerator />},
    { id: 'model-gen', title: '3D 모델 생성', component: <ModelGenerator /> },
    { id: 'thumbnail-gen', title: '썸네일 이미지 생성', component: <ThumbnailGenerator /> },
    { id: 'content-view', title: '콘텐츠 상세 조회', component: <ContentViewer /> },
    { id: 'copyright-check', title: '콘텐츠 저작권 검토', component: <CopyrightChecker /> },
    { id: 'content-submit', title: '콘텐츠 제출', component: <ContentSubmitter /> },
];

function Development() {
  // 초기 상태를 null로 설정하여 시작 화면을 먼저 표시
  const [activeViewId, setActiveViewId] = useState(null);

  // 선택된 뷰 컴포넌트를 찾음
  const activeView = activeViewId ? workspaceNavItems.find(item => item.id === activeViewId) : null;

  return (
    <div className="workspace-container new-design">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO DEV</div>
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
        {/* activeView가 있으면 해당 컴포넌트를, 없으면 WelcomeScreen을 렌더링 */}
        {activeView ? activeView.component : <WelcomeScreen onStart={() => setActiveViewId('approved-plan')} />}
      </main>
    </div>
  );
}

export default Development;