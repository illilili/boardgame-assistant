// Development.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

import { AiFillHome } from 'react-icons/ai'; //홈 버튼
import { FaUserCircle } from 'react-icons/fa'; //프로필
import { FiMoreHorizontal } from 'react-icons/fi';
import { getMyPageInfo } from '../api/users'; //마이페이지 api 사용
import { logout } from '../api/auth';
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
    { id: 'mypage', title: '마이페이지', component: null } // 마이페이지 컴포넌트는 나중에 추가
];

function Development() {
  // 초기 상태를 null로 설정하여 시작 화면을 먼저 표시
  const [activeViewId, setActiveViewId] = useState(null);
  const [userName, setUserName] = useState(''); //사이드바 하단 프로필 이름

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const data = await getMyPageInfo();
        setUserName(data.userName);
      } catch (err) {
        console.error('유저 이름 조회 실패', err);
      }
    };

    fetchUserName();
  }, []);

  //로그아웃 핸들러
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const result = await logout();
      alert(result.message); // "로그아웃 되었습니다."
      // 토큰 및 권한 정보 제거 - 추후 보고 삭제하거나 조정필요할듯
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      // 리디렉션 - 메인으로 이동
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 선택된 뷰 컴포넌트를 찾음
  const activeView = activeViewId ? workspaceNavItems.find(item => item.id === activeViewId) : null;

  return (
    <div className="workspace-container new-design">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="flex items-center gap-2 mb-4 px-4 py-2 rounded hover:text-teal-500 font-semibold" >
            <AiFillHome size={20} />
          </Link>
          <div className="logo">BOARD.CO DEV</div>
        </div>
        <ul className="workspace-nav-list">
          {workspaceNavItems
            .filter(item => item.id !== 'mypage')  // 마이페이지 메뉴만 제외
            .map(item => (
              <li
                key={item.id}
                className={`nav-item ${activeViewId === item.id ? 'active' : ''}`} //네비바에서 마이페이지는 안보이게 처리 - 액츄얼뷰 이용하게
                onClick={() => setActiveViewId(item.id)}
              >
                {item.title}
              </li>
          ))}
        </ul>

        {/* 하단 유저 메뉴 */}
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-gray-300">
          {/* 프로필 + 환영문구 묶음 */}
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center gap-3">
              <FaUserCircle size={40} className="text-gray-500" />
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold">{userName} 님</span>
                <span className="text-xs text-gray-500">환영합니다!</span>
              </div>
            </div>
            {/* 마이페이지 점세개 */}
            <button onClick={() => setActiveViewId('mypage')} className="text-white hover:text-teal-500">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded hover:bg-red-100 text-red-500 font-semibold"
          >
            로그아웃
          </button>
        </div>
      </aside>

      <main className="workspace-main-content">
        {/* activeView가 있으면 해당 컴포넌트를, 없으면 WelcomeScreen을 렌더링 */}
        {activeView ? activeView.component : <WelcomeScreen onStart={() => setActiveViewId('approved-plan')} />}
      </main>
    </div>
  );
}

export default Development;