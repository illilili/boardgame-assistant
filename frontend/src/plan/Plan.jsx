// Plan.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Plan.css'; 

// 분리된 컴포넌트들을 import 합니다.
import GameConceptCreator from './GameConceptCreator';
import Goal from './Goal';
import Components from './Components';
import RuleCreator from './RuleCreator';
import Review from './Review';
import WelcomeScreen from './WelcomeScreen';
import PlanPage from './PlanPage';

import { AiFillHome } from 'react-icons/ai'; //홈 버튼
import { FaUserCircle } from 'react-icons/fa'; //프로필
import { FiMoreHorizontal } from 'react-icons/fi';
import { getMyPageInfo } from '../api/users'; //마이페이지 api 사용
import { logout } from '../api/auth';


// Header 컴포넌트는 현재 사용되지 않으므로 import에서 제거했습니다.
// import Header from '../mainPage/Header'; 

// --- 데이터 및 메인 컴포넌트 ---
const workspaceNavItems = [
  { id: 'concept', title: '게임 컨셉 제작', component: <GameConceptCreator /> },
  { id: 'goal', title: '게임 목표 설계', component: <Goal/>},  
  { id: 'rules', title: '규칙 생성', component: <RuleCreator /> },
  { id: 'components', title: '게임 구성요소 생성', component: <Components/>},
  { id: 'review', title: '밸런스 테스트', component: <Review /> },
  { id: 'planPage', title: '기획안 관리', component: <PlanPage/>}

];

function Plan() {
  // 초기 상태를 null로 변경하여 아무것도 선택되지 않은 상태에서 시작
  const [activeViewId, setActiveViewId] = useState(null);

  // 선택된 뷰를 찾는 로직 변경
  const activeView = activeViewId ? workspaceNavItems.find(item => item.id === activeViewId) : null;

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
      

  return (
    <div className="workspace-container new-design">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="flex items-center gap-2 mb-4 px-4 py-2 rounded hover:text-teal-500 font-semibold" >
          <AiFillHome size={20} /></Link>
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

          {/* 하단 유저 메뉴 */}
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-gray-300">
          {/* 프로필 + 환영문구 묶음 */}
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center gap-3">
              <FaUserCircle size={40} className="text-gray-500" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{userName} 님</span>
                <span className="text-xs text-gray-500">환영합니다!</span>
              </div>
            </div>

            <Link to="/mypage" className="text-gray-600 hover:text-teal-500">
              <FiMoreHorizontal size={18} />
            </Link>
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
        {/* activeView가 있을 때만 해당 컴포넌트를, 없으면 WelcomeScreen을 렌더링 */}
        {activeView ? activeView.component : <WelcomeScreen onStart={() => setActiveViewId('concept')} />}
      </main>
    </div>
  );
}

export default Plan;
