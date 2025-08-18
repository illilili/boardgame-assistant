import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectContext } from '../contexts/ProjectContext';
import './Plan.css';
import Header from '../mainPage/Header';

import GameConceptCreator from './GameConceptCreator';
import Goal from './Goal';
import Components from './Components';
import RuleCreator from './RuleCreator';
import Review from './Review';
import WelcomeScreen from './WelcomeScreen';
import PlanPage from './PlanPage';

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
    const [activeViewId, setActiveViewId] = useState(null); // 초기값 null로 변경

    const activeView = activeViewId ? workspaceNavItems.find(item => item.id === activeViewId) : null;

    return (
        <>
            {/* ✨ projectMode prop을 true로 전달 */}
            <Header projectMode={true} />
            <ProjectContext.Provider value={{ projectId }}>
                <div className="workspace-container new-design">
                    <aside className="workspace-sidebar">
                        <div className="sidebar-header">
                            <div className="logo">PLAN</div>
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
            </ProjectContext.Provider>
        </>
    );
}

export default Plan;