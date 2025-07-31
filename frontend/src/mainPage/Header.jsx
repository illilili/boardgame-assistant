import React, { useState } from 'react';
import './Header.css'; // 헤더 전용 CSS 파일을 새로 임포트합니다.

const Header = () => (
  <header className="minimalist-header">
    <div className="logo-minimalist">BOARD.CO</div>
    <nav className="main-nav">
      <a href="#design" className="active">DESIGN</a>
      <a href="#product">PRODUCT</a>
      <a href="#project">PROJECT</a>
      <a href="#team">TEAM</a>
    </nav>
    <div className="hamburger-icon">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>
);


export default Header;
