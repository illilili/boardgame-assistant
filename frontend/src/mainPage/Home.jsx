import React from 'react';
import './Home.css';
// [수정됨] 1. assets 폴더에서 이미지를 불러옵니다.
// 경로가 다를 경우 ('../assets/boardgame.png' 등) 환경에 맞게 수정해주세요.
import boardgameImage from '../assets/boardgame.png'; 

// Header 컴포넌트
const Header = () => (
  <header className="minimalist-header">
    <div className="logo-minimalist">BOARD.CO</div>
    <nav className="main-nav">
      <a href="#planning" className="active">기획</a>
      <a href="#development">개발</a>
      <a href="#publishing">출판</a>
      <a href="#team">팀</a>
    </nav>
    <div className="hamburger-icon">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>
);

function Home() {
  return (
    <div className="architect-style-wrapper">
      <Header />
      <main className="grid-container">
        {/* 왼쪽 텍스트 섹션 */}
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

        {/* 오른쪽 이미지 섹션 */}
        <section className="image-content">
          {/* [수정됨] 2. 불러온 이미지 변수를 src 속성에 적용합니다. */}
          <img 
            src={boardgameImage} 
            alt="다양한 보드게임 구성 요소들이 조합된 이미지" 
            className="main-image"
          />
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
      </main>
    </div>
  );
}

export default Home;
