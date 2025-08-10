import React, { useState, useEffect } from 'react';
import './Header.css'; // 헤더 전용 CSS 파일을 새로 임포트합니다.
import { Link, useNavigate, useLocation } from 'react-router-dom';

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


return (
  <header className="minimalist-header">
    <div className="logo-minimalist">BOARD.CO</div>
    <nav className="main-nav">
      <Link to="/plan">기획</Link>
      <a href="/development">개발</a>
      <a href="/publishing">출판</a>
      <a href="/team">팀</a>
      
      {/* 로그인 상태가 아닐 때만 로그인/회원가입 버튼을 보여줌 */}
        {!isLoggedIn && (
          <>
            <Link to="/login">
              로그인
            </Link>
            <Link to="/signup">
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
