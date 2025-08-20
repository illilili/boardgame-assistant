import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TrendAnalysisHome.css';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';

const TrendAnalysisHome = () => {
  const navigate = useNavigate();

  const handleModeSelect = (mode) => {
    if (mode === 'live') {
      navigate('/trend/live-top50');
    } else if (mode === 'original') {
      navigate('/trend/original');
    } else if (mode === 'interactive') {
      navigate('/trend/interactive');
    }
  };

  return (
    <>
      <Header projectMode={false} />
      <div className="trend-analysis-home">
        {/* 배경 애니메이션 */}
        <div className="home-background"></div>
        
        <div className="home-container">
        {/* 헤더 */}
        <div className="home-header">
          <h1 className="home-title">🎲 보드게임 트렌드 분석</h1>
          <p className="home-subtitle">
            원하는 분석 모드를 선택하여 보드게임 시장의 인사이트를 탐색하세요
          </p>
        </div>

        {/* 분석 모드 선택 카드 */}
        <div className="mode-selection">
          {/* 실시간 TOP 50 분석 */}
          <div 
            className="mode-card live-mode"
            onClick={() => handleModeSelect('live')}
          >
            <div className="mode-icon">📈</div>
            <div className="mode-content">
              <h2 className="mode-title">실시간 TOP 30 보드게임 분석</h2>
              <p className="mode-description">
                BoardGameGeek에서 지금 가장 핫한 30개 게임의 실시간 트렌드를 분석합니다
              </p>
              <div className="mode-features">
                <div className="feature-item">⚡ 실시간 데이터</div>
                <div className="feature-item">📊 트렌드 요약</div>
                <div className="feature-item">🏆 TOP 30 랭킹</div>
                <div className="feature-item">🔍 상세 정보</div>
              </div>
              <div className="mode-badge live-badge">LIVE</div>
            </div>
            <div className="mode-arrow">→</div>
          </div>

          {/* 기존 인기 보드게임 분석 */}
          <div 
            className="mode-card original-mode"
            onClick={() => handleModeSelect('original')}
          >
            <div className="mode-icon">📚</div>
            <div className="mode-content">
              <h2 className="mode-title">기존 인기 보드게임 분석</h2>
              <p className="mode-description">
                10,000개 게임 데이터셋을 기반으로 한 종합적인 보드게임 시장 분석을 제공합니다
              </p>
              <div className="mode-features">
                <div className="feature-item">🎨 인기 테마 TOP 10</div>
                <div className="feature-item">⚖️ 난이도 분포</div>
                <div className="feature-item">👥 플레이어 수 분석</div>
                <div className="feature-item">⚙️ 인기 메커니즘 TOP10</div>
                <div className="feature-item">📊 시장 분석(버블차트)</div>
              </div>
              <div className="mode-badge original-badge">10K DATASET</div>
            </div>
            <div className="mode-arrow">→</div>
          </div>


        </div>

        {/* 특징 비교 */}
        <div className="comparison-section">
          <h3 className="comparison-title">📋 분석 모드 비교</h3>
          <div className="comparison-table">
            <div className="comparison-row header">
              <div className="comparison-cell">구분</div>
              <div className="comparison-cell">실시간 TOP 30</div>
              <div className="comparison-cell">기존 인기 보드게임</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell">데이터 소스</div>
              <div className="comparison-cell live-text">BoardGameGeek API</div>
              <div className="comparison-cell original-text">10K CSV 데이터셋</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell">게임 수</div>
              <div className="comparison-cell live-text">30개 (실시간)</div>
              <div className="comparison-cell original-text">10,000개</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell">업데이트</div>
              <div className="comparison-cell live-text">실시간</div>
              <div className="comparison-cell original-text">정적</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell">분석 깊이</div>
              <div className="comparison-cell live-text">트렌드 중심</div>
              <div className="comparison-cell original-text">종합 통계 분석</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell">주요 기능</div>
              <div className="comparison-cell live-text">랭킹, 상세정보, 번역</div>
              <div className="comparison-cell original-text">테마, 난이도, 메커니즘, 버블차트</div>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="home-footer">
          <p className="footer-text">
            💡 언제든지 다른 분석 모드로 전환할 수 있습니다
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default TrendAnalysisHome;