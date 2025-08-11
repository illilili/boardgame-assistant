import React, { useState } from 'react';
import './Header.css'; // 헤더 전용 CSS 파일을 새로 임포트합니다.
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => (
  <header className="minimalist-header">
    <div className="logo-minimalist">BOARD.CO</div>
    <nav className="main-nav">
      <Link to="/plan">기획</Link>
      <a href="/development">개발</a>
      <a href="/publish">출판</a>
      <a href="/team">팀</a>
      <a href='/plan-review'>기획안 리뷰</a>
    </nav>
    <div className="hamburger-icon">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>
);

export default Header;
