// Home.js

import React from 'react';
import './Home.css';
import boardgameImage from '../assets/boardgame.png'; 
import Header from './Header';

function Home() {
  return (
    <div className="architect-style-wrapper">
      <Header />
      <main className="grid-container">
        
        {/* [수정] 왼쪽 컨텐츠를 하나의 div로 묶어줍니다. */}
        <div className="left-column">
          {/* 텍스트 섹션 */}
          <section className="text-content">
            <div className="title-highlight-line"></div>
            <h1>
              상상을 현실로,<br />
              보드게임 제작의<br />
              모든 것.
            </h1>
            <p>아이디어 구상부터 샘플 제작, 그리고 성공적인 출시까지. 당신의 게임을 위한 최고의 파트너가 되어 드립니다.</p>
            <button className="explore-button">
              프로젝트 시작하기 <span className="arrow">→</span>
            </button>
            <div className="page-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </section>

          {/* 하단 검색 섹션 */}
          <section className="search-area">
            <div className="search-box">
              <div className="search-title">프로젝트 검색</div>
              <div className="search-inputs">
                <input type="text" placeholder="게임 장르" />
                <input type="text" placeholder="플레이 인원" />
              </div>
            </div>
            <button className="search-button">검색</button>
          </section>
        </div>

        {/* 오른쪽 이미지 섹션 */}
        <section className="image-content">
          <img 
            src={boardgameImage} 
            alt="사람들이 모여 보드게임을 즐기는 모습" 
            className="main-image"
          />
        </section>

      </main>
    </div>
  );
}

export default Home;