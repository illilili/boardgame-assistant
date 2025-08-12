// src/plan/Plan.js

import React, { useState, useEffect } from 'react';
import './Plan.css';

// API 함수 임포트
import { getMyPageInfo } from '../api/auth.js';

// ✅ './' 경로의 컴포넌트들 (같은 plan 폴더 내)
import WelcomeScreen from './WelcomeScreen';


// ✅ '../mainPage/' 경로의 컴포넌트들 (상위 폴더로 나갔다가 mainPage 폴더로 진입)
import Footer from '../mainPage/Footer';
import Modal from '../mainPage/Modal';
import PrivacyPolicy from '../mainPage/PrivacyPolicy';
import TermsOfService from '../mainPage/TermsOfService';
import ProjectCreationPage from './ProjectCreationPage.jsx';
import GameConceptCreator from './GameConceptCreator.jsx';
import Goal from './Goal.jsx';
import RuleCreator from './RuleCreator.jsx';
import Components from './Components.jsx';
import Review from './Review.jsx';
import PlanPage from './PlanPage.jsx';
// ✨ 페이지 컴포넌트 정의를 Plan 함수 바깥으로 이동
// 이렇게 하면 Plan 컴포넌트가 리렌더링 되어도 이 컴포넌트들은 새로 생성되지 않습니다.



const workspaceNavItems = [
    { id: 'dashboard', title: 'Dashboard', component: <WelcomeScreen /> },
    { id: 'project', title: '프로젝트 생성', component: <ProjectCreationPage /> },
    { id: 'concept', title: '게임 컨셉 제작', component: <GameConceptCreator /> },
    { id: 'goal', title: '게임 목표 설계', component: <Goal /> },
    { id: 'rules', title: '규칙 생성', component: <RuleCreator /> },
    { id: 'components', title: '게임 구성요소 생성', component: <Components /> },
    { id: 'review', title: '밸런스 테스트', component: <Review /> },
    { id: 'planPage', title: '기획안 관리', component: <PlanPage /> },
];


function Plan() {
    // --- 상태 관리 ---
    const [activeViewId, setActiveViewId] = useState('dashboard');
    const [theme, setTheme] = useState('light');

    // 모달 상태
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    // 사용자 정보를 API로부터 받아와 관리합니다.
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- 데이터 로딩 ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getMyPageInfo();
                const userData = {
                    fullName: data.userName,
                    firstName: data.userName.split(' ')[0],
                    username: data.email,
                };
                setUser(userData);
            } catch (err) {
                setError(err.message || '사용자 정보를 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);


    // --- 이벤트 핸들러 ---
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleOpenPrivacyModal = (e) => { e.preventDefault(); setIsPrivacyModalOpen(true); };
    const handleClosePrivacyModal = () => { setIsPrivacyModalOpen(false); };
    const handleOpenTermsModal = (e) => { e.preventDefault(); setIsTermsModalOpen(true); };
    const handleCloseTermsModal = () => { setIsTermsModalOpen(false); };

    // --- 렌더링 로직 ---
    const activeComponent = workspaceNavItems.find(item => item.id === activeViewId)?.component || <WelcomeScreen />;

    return (
        <div className={`workspace-container v2-design ${theme}`}>
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
                            <span className="nav-icon">{item.icon}</span>
                            {item.title}
                        </li>
                    ))}
                </ul>
                <div className="sidebar-footer">
                    <ul className="workspace-nav-list">
                        <li className="nav-item">Settings</li>
                        <li className="nav-item">Support</li>
                    </ul>
                    <div className="nav-item logout">Log Out</div>
                </div>
            </aside>

            <main className="workspace-main-content">
                <header className="main-content-header">
                    <div className="header-left">
                        <h2>
                            {isLoading ? 'Loading...' : (user ? `Welcome, ${user.firstName}` : 'Welcome')}
                        </h2>
                    </div>
                    <div className="header-right">
                        {/* [수정됨] 테마 변경 버튼 추가 */}
                        <button onClick={toggleTheme} className="theme-toggle-button">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        
                        <div className="header-icon">🔔</div>
                        
                        {user && (
                            <div className="user-profile">
                                <img src={`https://i.pravatar.cc/40?u=${user.username}`} alt={user.fullName} />
                                <span>{user.fullName}</span>
                                <span className="chevron">▼</span>
                            </div>
                        )}
                    </div>
                </header>
                
                <div className="main-content-area">
                    {error ? <div className="error-message">{error}</div> : activeComponent}
                </div>

            </main>

            {isPrivacyModalOpen && (
                <Modal onClose={handleClosePrivacyModal}><PrivacyPolicy /></Modal>
            )}
            {isTermsModalOpen && (
                <Modal onClose={handleCloseTermsModal}><TermsOfService /></Modal>
            )}
        </div>
    );
}

export default Plan;
