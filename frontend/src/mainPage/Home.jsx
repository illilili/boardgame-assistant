// Home.js

import React, { useState } from 'react';
import './Home.css';
import Header from './Header';
import Footer from './Footer';
import Modal from './Modal';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

// 1단계에서 만든 CardCarousel 컴포넌트를 임포트합니다.
import CardCarousel from './CardCarousel'; 

function Home() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleOpenPrivacyModal = (e) => {
    e.preventDefault();
    setIsPrivacyModalOpen(true);
  };

  const handleClosePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
  };

  const handleOpenTermsModal = (e) => {
    e.preventDefault();
    setIsTermsModalOpen(true);
  };

  const handleCloseTermsModal = () => {
    setIsTermsModalOpen(false);
  };

  return (
    // CSS에서 배경과 레이아웃을 담당하는 래퍼
    <div className="architect-style-wrapper">
      <Header />
      
      {/* 기존 main.grid-container 대신 캐러셀을 렌더링합니다. */}
      <main className="main-carousel-area">
        <CardCarousel />
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