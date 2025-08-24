import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectContext } from '../contexts/ProjectContext';
import './Plan.css';
import Header from '../mainPage/Header';

// ✨ 아이콘 라이브러리 import
import { FaLightbulb, FaBullseye, FaScroll, FaCubes, FaBalanceScale, FaFileAlt } from 'react-icons/fa';

import GameConceptCreator from './GameConceptCreator';
import Goal from './Goal';
import Components from './Components';
import RuleCreator from './RuleCreator';
import Review from './Review';
import WelcomeScreen from './WelcomeScreen';
import PlanPage from './PlanPage';

// ✨ 각 항목에 아이콘 추가
const workspaceNavItems = [
  { id: 'concept', title: '게임 컨셉 제작', component: <GameConceptCreator /> },
  { id: 'goal', title: '게임 목표 설계', component: <Goal /> },
  { id: 'rules', title: '규칙 생성', component: <RuleCreator /> },
  { id: 'components', title: '게임 구성요소 생성', component: <Components /> },
  { id: 'review', title: '밸런스 테스트', component: <Review /> },
  { id: 'planPage', title: '기획안 관리', component: <PlanPage /> },
];

function Plan() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeViewId, setActiveViewId] = useState(null);

  const activeView = activeViewId ? workspaceNavItems.find(item => item.id === activeViewId) : null;

  return (
    <>
      <Header projectMode={true} />
      <ProjectContext.Provider value={{ projectId }}>
        <div className="plan-page__container">
          <aside className="plan-page__sidebar">
            <div className="plan-page__sidebar-header">
              <div
                className="plan-page__logo"
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                PLAN
              </div>
            </div>
            <nav className="plan-page__nav">
              <ul className="plan-page__nav-list">
                {workspaceNavItems.map((item) => (
                  <li
                    key={item.id}
                    className={`plan-page__nav-item ${activeViewId === item.id ? 'active' : ''}`}
                    onClick={() => setActiveViewId(item.id)}
                  >
                    {/* ✨ 아이콘과 타이틀 렌더링 */}
                    <span className="nav-item__icon">{item.icon}</span>
                    <span className="nav-item__title">{item.title}</span>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="plan-page__main-content">
            {activeView ? activeView.component : <WelcomeScreen onStart={() => setActiveViewId('concept')} />}
          </main>
        </div>
      </ProjectContext.Provider>
    </>
  );
}

export default Plan;
