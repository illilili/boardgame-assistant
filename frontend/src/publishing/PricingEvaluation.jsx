// PricingEvaluation.jsx 가격 측정
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingEvaluation.css';

function PricingEvaluation() {
  const navigate = useNavigate();
  const [translatedGames, setTranslatedGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [pricingData, setPricingData] = useState({
    developmentCost: '',
    translationCost: '',
    marketingCost: '',
    platformFee: '',
    suggestedPrice: '',
    targetMargin: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummyGames = [
      {
        id: 1,
        gameTitle: "할리갈리2",
        status: "TRANSLATION_APPROVED",
        gameDetails: {
          theme: "카드 게임",
          playerCount: "2-6명",
          playTime: "15분",
          difficulty: "쉬움"
        },
        translatedLanguages: ['영어', '일본어'],
        completedAt: "2024-01-26",
        pricingStatus: "PENDING"
      },
      {
        id: 2,
        gameTitle: "할리갈리22",
        status: "TRANSLATION_APPROVED", 
        gameDetails: {
          theme: "전략 게임",
          playerCount: "3-4명",
          playTime: "45분",
          difficulty: "보통"
        },
        translatedLanguages: ['영어', '중국어'],
        completedAt: "2024-01-25",
        pricingStatus: "EVALUATED"
      }
    ];

    // 기존 가격 책정 데이터 시뮬레이션
    const existingPricing = {
      2: {
        developmentCost: '500000',
        translationCost: '200000',
        marketingCost: '300000',
        platformFee: '30',
        suggestedPrice: '15000',
        targetMargin: '40',
        notes: '해외 시장 진출을 고려한 경쟁력 있는 가격 책정'
      }
    };

    setTimeout(() => {
      setTranslatedGames(dummyGames);
      setLoading(false);

      // 선택된 게임이 있고 기존 가격 데이터가 있다면 로드
      if (selectedGame && existingPricing[selectedGame.id]) {
        setPricingData(existingPricing[selectedGame.id]);
      }
    }, 500);
  }, [selectedGame]);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    // 게임 선택 시 기존 가격 데이터 로드
    if (game.pricingStatus === 'EVALUATED') {
      setPricingData({
        developmentCost: '500000',
        translationCost: '200000',
        marketingCost: '300000',
        platformFee: '30',
        suggestedPrice: '15000',
        targetMargin: '40',
        notes: '해외 시장 진출을 고려한 경쟁력 있는 가격 책정'
      });
    } else {
      setPricingData({
        developmentCost: '',
        translationCost: '',
        marketingCost: '',
        platformFee: '',
        suggestedPrice: '',
        targetMargin: '',
        notes: ''
      });
    }
  };

  const handleInputChange = (field, value) => {
    setPricingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalCost = () => {
    const dev = parseFloat(pricingData.developmentCost) || 0;
    const trans = parseFloat(pricingData.translationCost) || 0;
    const marketing = parseFloat(pricingData.marketingCost) || 0;
    const platformFee = parseFloat(pricingData.platformFee) || 0;
    const suggestedPrice = parseFloat(pricingData.suggestedPrice) || 0;
    
    const totalCost = dev + trans + marketing;
    const platformCost = (suggestedPrice * platformFee) / 100;
    const netRevenue = suggestedPrice - platformCost;
    const profit = netRevenue - totalCost;
    const marginPercent = netRevenue > 0 ? (profit / netRevenue) * 100 : 0;
    
    return {
      totalCost,
      platformCost,
      netRevenue,
      profit,
      marginPercent
    };
  };

  const savePricingData = () => {
    if (!selectedGame) return;

    // 실제로는 API 호출
    alert(`${selectedGame.gameTitle}의 가격 책정이 저장되었습니다.`);
    
    // 상태 업데이트
    setTranslatedGames(prev => prev.map(game => 
      game.id === selectedGame.id 
        ? { ...game, pricingStatus: 'EVALUATED' }
        : game
    ));
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return '대기중';
      case 'EVALUATED': return '완료';
      default: return '대기중';
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  const calculations = calculateTotalCost();

  return (
    <div className="pricing-workspace">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
        </div>
        <ul className="workspace-nav-list">
          <li className="nav-item" onClick={() => navigate('/publishing')}>기획안 제출 목록</li>
          <li className="nav-item" onClick={() => navigate('/developer-assignment')}>개발자 배정</li>
          <li className="nav-item" onClick={() => navigate('/translation')}>번역</li>
          <li className="nav-item" onClick={() => navigate('/translation-review')}>번역 검토</li>
          <li className="nav-item nav-header">가격 책정</li>
          <li className="nav-item" onClick={() => navigate('/final-approval')}>최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="creator-container">
          <div className="form-column">
            <div className="form-section">
              <h2>가격 책정 대기 중인 게임</h2>
              <div className="game-cards-grid">
                {translatedGames.map(game => (
                  <div 
                    key={game.id}
                    className={`game-card ${selectedGame?.id === game.id ? 'selected' : ''}`}
                    onClick={() => handleGameSelect(game)}
                  >
                    <div className="game-card-header">
                      <h3 className="game-title">{game.gameTitle}</h3>
                      <span className={`status-badge ${game.pricingStatus.toLowerCase()}`}>
                        {getStatusText(game.pricingStatus)}
                      </span>
                    </div>
                    <div className="game-card-content">
                      <p><strong>테마:</strong> {game.gameDetails.theme}</p>
                      <p><strong>플레이어:</strong> {game.gameDetails.playerCount}</p>
                      <p><strong>플레이 시간:</strong> {game.gameDetails.playTime}</p>
                      <p><strong>번역 언어:</strong> {game.translatedLanguages.join(', ')}</p>
                      <p className="approval-date"><strong>번역 완료:</strong> {game.completedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="result-column">
            {selectedGame ? (
              <div className="pricing-management">
                <div className="selected-game-info">
                  <h3>{selectedGame.gameTitle}</h3>
                  <p><strong>상태:</strong> {getStatusText(selectedGame.pricingStatus)}</p>
                  <p><strong>번역 언어:</strong> {selectedGame.translatedLanguages.join(', ')}</p>
                </div>

                <div className="pricing-form">
                  <h4>비용 입력</h4>
                  <div className="form-group">
                    <label>개발 비용 (원)</label>
                    <input
                      type="number"
                      value={pricingData.developmentCost}
                      onChange={(e) => handleInputChange('developmentCost', e.target.value)}
                      placeholder="개발 비용"
                    />
                  </div>

                  <div className="form-group">
                    <label>번역 비용 (원)</label>
                    <input
                      type="number"
                      value={pricingData.translationCost}
                      onChange={(e) => handleInputChange('translationCost', e.target.value)}
                      placeholder="번역 비용"
                    />
                  </div>

                  <div className="form-group">
                    <label>마케팅 비용 (원)</label>
                    <input
                      type="number"
                      value={pricingData.marketingCost}
                      onChange={(e) => handleInputChange('marketingCost', e.target.value)}
                      placeholder="마케팅 비용"
                    />
                  </div>

                  <div className="form-group">
                    <label>플랫폼 수수료 (%)</label>
                    <input
                      type="number"
                      value={pricingData.platformFee}
                      onChange={(e) => handleInputChange('platformFee', e.target.value)}
                      placeholder="30"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label>제안 판매가 (원)</label>
                    <input
                      type="number"
                      value={pricingData.suggestedPrice}
                      onChange={(e) => handleInputChange('suggestedPrice', e.target.value)}
                      placeholder="제안 판매가"
                    />
                  </div>

                  <div className="form-group">
                    <label>목표 마진 (%)</label>
                    <input
                      type="number"
                      value={pricingData.targetMargin}
                      onChange={(e) => handleInputChange('targetMargin', e.target.value)}
                      placeholder="40"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="pricing-calculations">
                  <h4>수익성 분석</h4>
                  <div className="calculation-item">
                    <span className="label">총 비용:</span>
                    <span className="value">{calculations.totalCost.toLocaleString()}원</span>
                  </div>
                  <div className="calculation-item">
                    <span className="label">플랫폼 수수료:</span>
                    <span className="value">{calculations.platformCost.toLocaleString()}원</span>
                  </div>
                  <div className="calculation-item">
                    <span className="label">순수익:</span>
                    <span className="value">{calculations.netRevenue.toLocaleString()}원</span>
                  </div>
                  <div className="calculation-item">
                    <span className="label">이익:</span>
                    <span className={`value ${calculations.profit >= 0 ? 'positive' : 'negative'}`}>
                      {calculations.profit.toLocaleString()}원
                    </span>
                  </div>
                  <div className="calculation-item">
                    <span className="label">마진:</span>
                    <span className={`value ${calculations.marginPercent >= 0 ? 'positive' : 'negative'}`}>
                      {calculations.marginPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="notes-section">
                  <label>메모</label>
                  <textarea
                    value={pricingData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="가격 책정에 대한 메모를 입력하세요..."
                    rows="4"
                  />
                </div>

                <div className="action-buttons">
                  <button 
                    className="save-btn"
                    onClick={savePricingData}
                  >
                    가격 책정 저장
                  </button>
                </div>
              </div>
            ) : (
              <div className="welcome-screen">
                <div className="welcome-icon">💰</div>
                <h2>가격 책정 관리</h2>
                <p>게임을 선택하여 비용을 입력하고 최적의 판매가를 책정하세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PricingEvaluation;
