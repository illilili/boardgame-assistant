// Plan.js
import React, { useState } from 'react';
import './Plan.css'; 

// 분리된 컴포넌트들을 import 합니다.
import GameConceptCreator from './GameConceptCreator';
import RuleCreator from './RuleCreator';
import ComponentCreator from './ComponentCreator';
import Review from './Review';
import WelcomeScreen from './WelcomeScreen';

// Header 컴포넌트는 현재 사용되지 않으므로 import에서 제거했습니다.
// import Header from '../mainPage/Header'; 

// --- 데이터 및 메인 컴포넌트 ---
const workspaceNavItems = [
  { id: 'concept', title: '게임 컨셉 제작', component: <GameConceptCreator /> },
  { id: 'rules', title: '규칙 생성', component: <RuleCreator /> },
  { id: 'components', title: '자원 및 구성 요소 생성', component: <ComponentCreator /> },
  { id: 'review', title: '검토', component: <Review /> },
];

function Plan() {
  // 초기 상태를 null로 변경하여 아무것도 선택되지 않은 상태에서 시작
  const [activeViewId, setActiveViewId] = useState(null);

  // 선택된 뷰를 찾는 로직 변경
  const activeView = activeViewId ? workspaceNavItems.find(item => item.id === activeViewId) : null;

  return (
    <div className="workspace-container new-design">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
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
        {/* activeView가 있을 때만 해당 컴포넌트를, 없으면 WelcomeScreen을 렌더링 */}
        {activeView ? activeView.component : <WelcomeScreen onStart={() => setActiveViewId('concept')} />}
      </main>
    </div>
  );
}

export default Plan;
