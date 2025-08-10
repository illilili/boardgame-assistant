import React, { useState, useEffect } from 'react';
import './Header.css'; // 헤더 전용 CSS 파일을 새로 임포트합니다.
import { Link, useNavigate, useLocation } from 'react-router-dom';

// api import
import { logout } from '../api/auth.js';


const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // localStorage에 accessToken이 있으면 로그인 상태로 간주
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
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
        // 리디렉션 우선 주석처리
        // window.location.href = '/login';
      } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    };
  
return (
  <header className="minimalist-header">
    <div className="logo-minimalist">BOARD.CO</div>
    <nav className="main-nav">
      <Link to="/plan">기획</Link>
      <a href="/development">개발</a>
      <a href="/publishing">출판</a>
      <a href="/team">팀</a>
      
      {isLoggedIn ? (
        // 로그인 상태일 때만 '로그아웃' 버튼을 보여줌
        <a onClick={handleLogout}> 로그아웃 </a>
      ) : (
        // 로그인 상태가 아닐 때만 '로그인'과 '회원가입' 버튼을 보여줌
        <>
          <Link to="/login" >
            로그인
          </Link>
          <Link to="/register" >
            회원가입
          </Link>
        </>
      )}
    </nav>
    <div className="hamburger-icon">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>
);
};
export default Header;
