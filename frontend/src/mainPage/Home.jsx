import React, { useState, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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

// 메인 페이지 섹션 컴포넌트
import HowToUse from './HowToUse';
import Gallery from './Gallery';
import Cta from './Cta';
import FeatureHighlights from './FeatureHighlights'; // 새로 추가된 컴포넌트

function Home() {
  // 모달 상태 관리
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // 스크롤 이동을 위한 ref 생성
  const howToUseRef = useRef(null);
  const navigate = useNavigate();

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

  // "사용 방법 보기" 버튼 클릭 핸들러
  const handleScrollToHowToUse = () => {
    howToUseRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // "프로젝트 생성하기" 버튼 클릭 핸들러
  const handleCreateProjectClick = () => {
    const isLoggedIn = !!localStorage.getItem('accessToken');
    if (isLoggedIn) {
      navigate('/projects');
    } else {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  };

  return (
    <div className="architect-style-wrapper">
      <Header />

      <main>
        <Routes>
          <Route path="/" element={
            <>
              {/* --- 히어로 섹션 --- */}
              <div className="grid-container">
                <div className="left-column">
                  <section className="text-content">
                    <div className="title-highlight-line"></div>
                    <h1>
                      상상을 현실로,<br />
                      보드게임 제작의<br />
                      모든 것.
                    </h1>
                    <p>아이디어 구상부터 샘플 제작, 그리고 성공적인 출시까지. 당신의 게임을 위한 최고의 파트너가 되어 드립니다.</p>
                    <button className="explore-button" onClick={handleScrollToHowToUse}>
                      사용 방법 보기 <span className="arrow">→</span>
                    </button>
                  </section>

                  {/* --- 기능 하이라이트 섹션 (기존 검색 영역 대체) --- */}
                  <FeatureHighlights />
                
                </div>
                <section className="image-content">
                  <img
                    src={boardgameImage}
                    alt="사람들이 모여 보드게임을 즐기는 모습"
                    className="main-image"
                  />
                </section>
              </div>
              
              {/* --- 추가 섹션들 --- */}
              <HowToUse ref={howToUseRef} />
              <Gallery />
              <Cta onCreateProjectClick={handleCreateProjectClick} />
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