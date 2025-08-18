import React, { useState } from 'react';
import './Publish.css'; // ✅ 정상: 같은 폴더에 있음

// 🚨 임포트 경로 수정 (아래와 같이 되어있는지 확인)
import PlanReview from './PlanReview'; // ✅ 정상: 같은 폴더에 있음
import AssignDeveloperPage from './AssignDeveloperPage'; // ✅ 정상: 같은 폴더에 있음
import TranslationWrapper from './TranslationWrapper';
import PricingEvaluation from './PricingEvaluation';


const workspaceNavItems = [
    { id: 'planapproval', title: '기획서 승인', component: <PlanReview/> },
    { id: 'developassi', title: '개발자 투입', component: <AssignDeveloperPage/> },
    { id: 'translation', title: '번역', component: <TranslationWrapper/> },
    { id: 'pricing', title: '가격 책정', component: <PricingEvaluation/> },
];

function Publish() {
    const [activeViewId, setActiveViewId] = useState('planapproval'); // 🚨 초기 뷰를 '기획서 승인'으로 설정
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
            {/* 🚨 메인 컨텐츠 영역 추가 */}
            <main className="workspace-main-content">
                {activeView ? (
                    activeView.component
                ) : (
                    <div className="welcome-screen">
                        <span className="welcome-icon">👋</span>
                        <h2>환영합니다!</h2>
                        <p>왼쪽 메뉴에서 작업을 선택하여 시작해주세요.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Publish;
