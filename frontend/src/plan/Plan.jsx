// Plan.js
import React, { useState } from 'react';
import './Plan.css'; 

// 분리된 컴포넌트들을 import 합니다.
import ProjectCreationPage from './ProjectCreationPage';
import GameConceptCreator from './GameConceptCreator';
import Goal from './Goal';
import Components from './Components';
import RuleCreator from './RuleCreator';
import Review from './Review';
import WelcomeScreen from './WelcomeScreen';
import PlanPage from './PlanPage';
import SubmissionPage from './SubmissionPage';
import PlanManager from './PlanManager';


// Header 컴포넌트는 현재 사용되지 않으므로 import에서 제거했습니다.
// import Header from '../mainPage/Header'; 

// --- 데이터 및 메인 컴포넌트 ---
const workspaceNavItems = [
  { id: 'project', title: '프로젝트 생성', component: <ProjectCreationPage /> },
  { id: 'concept', title: '게임 컨셉 제작', component: <GameConceptCreator /> },
  { id: 'goal', title: '게임 목표 설계', component: <Goal/>},  
  { id: 'rules', title: '규칙 생성', component: <RuleCreator /> },
  { id: 'components', title: '게임 구성요소 생성', component: <Components/>},
  { id: 'review', title: '밸런스 테스트', component: <Review /> },
  { id: 'planPage', title: '기획안 관리', component: <PlanPage/>},
  { id: 'submission', title: '기획안 제출', component: <SubmissionPage/>},
  { id: 'planmanger', title: '기획안 관리자', component: <PlanManager/>},
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
