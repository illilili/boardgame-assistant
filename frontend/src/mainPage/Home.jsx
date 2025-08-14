import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './Home.css';
import boardgameImage from '../assets/boardgame.png';

// 공통 레이아웃
import Header from './Header';
import Footer from './Footer';
import Modal from './Modal';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

// 내부 서브 페이지
import MainContent from './MainContent';
import Plan from '../plan/Plan';
import Development from '../development/Development';
import Publish from '../publish/Publish';

function Home() {
  // 모달 상태 관리
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleOpenPrivacyModal = (e) => {
    e.preventDefault();
    setIsPrivacyModalOpen(true);
  };
  const handleClosePrivacyModal = () => setIsPrivacyModalOpen(false);

  const handleOpenTermsModal = (e) => {
    e.preventDefault();
    setIsTermsModalOpen(true);
  };
  const handleCloseTermsModal = () => setIsTermsModalOpen(false);

  return (
    <div className="architect-style-wrapper">
      <Header />

      {/* 메인 영역: 내부 라우트 */}
      <main className="grid-container">
        <Routes>
          <Route path="/" element={
            <>
              {/* 기존 메인 페이지 UI */}
              <div className="left-column">
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

                <section className="search-area">
                  <div className="search-box">
                    <div className="search-title">프로젝트 검색</div>
                    <div className="search-inputs">
                      <input type="text" placeholder="게임 장르" />dk
                      <input type="text" placeholder="플레이 인원" />
                    </div>
                  </div>
                  <button className="search-button">검색</button>
                </section>
              </div>

              <section className="image-content">
                <img 
                  src={boardgameImage} 
                  alt="사람들이 모여 보드게임을 즐기는 모습" 
                  className="main-image"
                />
              </section>
            </>
          } />
          
          <Route path="plan" element={<Plan />} />
          <Route path="development" element={<Development />} />
          <Route path="publish" element={<Publish />} />
          <Route path="main-content" element={<MainContent />} />
        </Routes>
      </main>

      <Footer 
        onPrivacyClick={handleOpenPrivacyModal} 
        onTermsClick={handleOpenTermsModal} 
      />

      {isPrivacyModalOpen && (
        <Modal onClose={handleClosePrivacyModal}>
          <PrivacyPolicy />
        </Modal>
      )}
      {isTermsModalOpen && (
        <Modal onClose={handleCloseTermsModal}>
          <TermsOfService />
        </Modal>
      )}
    </div>
  );
}

export default Home;
