import React, { useState } from 'react';
import './Plan.css'; 

// 분리된 컴포넌트들을 import 합니다.
import GameConceptCreator from './GameConceptCreator';
import Goal from './Goal';
import Components from './Components';
import RuleCreator from './RuleCreator';
import Review from './Review';
import WelcomeScreen from './WelcomeScreen';
import PlanPage from './PlanPage';

// 기획 단계별 네비게이션 아이템 목록
const workspaceNavItems = [
    { id: 'concept', title: '게임 컨셉 제작', component: <GameConceptCreator /> },
    { id: 'goal', title: '게임 목표 설계', component: <Goal/>},  
    { id: 'rules', title: '규칙 생성', component: <RuleCreator /> },
    { id: 'components', title: '게임 구성요소 생성', component: <Components/>},
    { id: 'review', title: '밸런스 테스트', component: <Review /> },
    { id: 'planPage', title: '기획안 관리', component: <PlanPage/>},
];

/**
 * 전체 기획 프로세스를 관리하는 메인 컴포넌트입니다.
 * 왼쪽 사이드바와 오른쪽 메인 콘텐츠 영역으로 구성됩니다.
 */
function Plan() {
    const [activeViewId, setActiveViewId] = useState('concept');

    const activeView = activeViewId ? workspaceNavItems.find(item => item.id === activeViewId) : null;

    return (
        <div className="workspace-container new-design">
            <aside className="workspace-sidebar">
                <div className="sidebar-header">
                    <div className="logo">PLANNING</div>
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
                {activeView ? activeView.component : <WelcomeScreen onStart={() => setActiveViewId('concept')} />}
            </main>
        </div>
    );
}

export default Plan;
