// Home.js

import React, { useState } from 'react';
import './Home.css';
import boardgameImage from '../assets/boardgame.png'; // 이 경로는 프로젝트 구조에 따라 조정해야 합니다.
import Header from './Header';
import Footer from './Footer';
import Modal from './Modal'; // Modal 컴포넌트 임포트
import PrivacyPolicy from './PrivacyPolicy'; // 개인정보처리방침 컴포넌트 임포트
import TermsOfService from './TermsOfService'; // 이용약관 컴포넌트 임포트

function Home() {
  // 개인정보처리방침 모달의 열림/닫힘 상태를 관리합니다.
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  // 이용약관 모달의 열림/닫힘 상태를 관리합니다.
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // 개인정보처리방침 모달을 여는 함수입니다.
  const handleOpenPrivacyModal = (e) => {
    e.preventDefault(); // 기본 링크 이동을 막습니다.
    setIsPrivacyModalOpen(true);
  };

  // 개인정보처리방침 모달을 닫는 함수입니다.
  const handleClosePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
  };

  // 이용약관 모달을 여는 함수입니다.
  const handleOpenTermsModal = (e) => {
    e.preventDefault(); // 기본 링크 이동을 막습니다.
    setIsTermsModalOpen(true);
  };

  // 이용약관 모달을 닫는 함수입니다.
  const handleCloseTermsModal = () => {
    setIsTermsModalOpen(false);
  };

  return (
    <div className="architect-style-wrapper">
      <Header /> {/* 헤더 컴포넌트 */}
      <main className="grid-container">
        
        {/* 왼쪽 컨텐츠 섹션 */}
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

      {/* 푸터 컴포넌트에 모달을 여는 함수들을 props로 전달합니다. */}
      {/* onPrivacyClick과 onTermsClick은 푸터에서 각 링크 클릭 시 호출됩니다. */}
      <Footer 
        onPrivacyClick={handleOpenPrivacyModal} 
        onTermsClick={handleOpenTermsModal} 
      />

      {/* isPrivacyModalOpen 상태가 true일 때만 개인정보처리방침 모달을 렌더링합니다. */}
      {isPrivacyModalOpen && (
        <Modal onClose={handleClosePrivacyModal}>
          <PrivacyPolicy />
        </Modal>
      )}

      {/* isTermsModalOpen 상태가 true일 때만 이용약관 모달을 렌더링합니다. */}
      {isTermsModalOpen && (
        <Modal onClose={handleCloseTermsModal}>
          <TermsOfService />
        </Modal>
      )}
    </div>
  );
}

export default Home;
