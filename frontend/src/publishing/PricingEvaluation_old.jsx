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

    setTimeout(() => {
      setTranslatedGames(dummyGames);
      setLoading(false);
    }, 500);
  }, []);

  const handleGameClick = (game) => {
    setSelectedGame(game);
    // 기존 가격 데이터가 있으면 로드
    setPricingData({
      developmentCost: game.pricingStatus === 'EVALUATED' ? '5000000' : '',
      translationCost: game.pricingStatus === 'EVALUATED' ? '800000' : '',
      marketingCost: game.pricingStatus === 'EVALUATED' ? '2000000' : '',
      platformFee: game.pricingStatus === 'EVALUATED' ? '15' : '',
      suggestedPrice: game.pricingStatus === 'EVALUATED' ? '25000' : '',
      targetMargin: game.pricingStatus === 'EVALUATED' ? '30' : '',
      notes: game.pricingStatus === 'EVALUATED' ? '시장 분석 완료. 경쟁 제품 대비 적정 가격.' : ''
    });
  };

  const handleInputChange = (field, value) => {
    setPricingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalCost = () => {
    const dev = parseInt(pricingData.developmentCost) || 0;
    const trans = parseInt(pricingData.translationCost) || 0;
    const marketing = parseInt(pricingData.marketingCost) || 0;
    return dev + trans + marketing;
  };

  const calculateExpectedRevenue = () => {
    const price = parseInt(pricingData.suggestedPrice) || 0;
    const platformFeeRate = parseInt(pricingData.platformFee) || 0;
    return price * (1 - platformFeeRate / 100);
  };

  const handleSavePricing = () => {
    if (!selectedGame) return;

    setTranslatedGames(prev =>
      prev.map(game =>
        game.id === selectedGame.id
          ? { ...game, pricingStatus: 'EVALUATED', pricingData }
          : game
      )
    );

    alert(`${selectedGame.gameTitle}의 가격 측정이 완료되었습니다.`);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

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
          <li className="nav-item nav-header">가격 평가</li>
          <li className="nav-item" onClick={() => navigate('/final-approval')}>최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="content-layout">
          <div className="submissions-grid">
            <h4>번역 완료된 게임</h4>
            <div className="game-cards-grid">
              {translatedGames.map((game) => (
                <div 
                  key={game.id} 
                  className={`game-card ${selectedGame?.id === game.id ? 'selected' : ''}`}
                  onClick={() => handleGameClick(game)}
                >
                  <div className="game-card-header">
                    <h3 className="game-title">{game.gameTitle}</h3>
                    <span className={`status-badge ${game.pricingStatus.toLowerCase()}`}>
                      대기
                    </span>
                  </div>
                  <div className="game-card-content">
                    <p><strong>테마:</strong> {game.gameDetails.theme}</p>
                    <p><strong>플레이어:</strong> {game.gameDetails.playerCount}</p>
                    <p><strong>플레이 시간:</strong> {game.gameDetails.playTime}</p>
                    <p><strong>번역 언어:</strong> {game.translatedLanguages.join(', ')}</p>
                    <p className="approval-date"><strong>제출일:</strong> {game.completedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-panel">
          {!selectedGame ? (
          <div className="welcome-screen">
            <div className="welcome-icon">💰</div>
            <h2>가격 측정</h2>
            <p>위 목록에서 게임을 선택하여 가격을 측정하세요.</p>
          </div>
        ) : (
          <div className="pricing-content">
            <div className="game-info-section">
              <h2>{selectedGame.gameTitle} - 가격 측정</h2>
              <div className="game-details">
                <p><strong>테마:</strong> {selectedGame.gameDetails.theme}</p>
                <p><strong>플레이어:</strong> {selectedGame.gameDetails.playerCount}</p>
                <p><strong>번역 언어:</strong> {selectedGame.translatedLanguages.join(', ')}</p>
                <p><strong>완료일:</strong> {selectedGame.completedAt}</p>
              </div>
            </div>

            <div className="pricing-form">
              <h3>비용 산정</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>개발 비용 (원)</label>
                  <input
                    type="number"
                    value={pricingData.developmentCost}
                    onChange={(e) => handleInputChange('developmentCost', e.target.value)}
                    placeholder="예: 5,000,000"
                  />
                </div>
                <div className="form-group">
                  <label>번역 비용 (원)</label>
                  <input
                    type="number"
                    value={pricingData.translationCost}
                    onChange={(e) => handleInputChange('translationCost', e.target.value)}
                    placeholder="예: 800,000"
                  />
                </div>
                <div className="form-group">
                  <label>마케팅 비용 (원)</label>
                  <input
                    type="number"
                    value={pricingData.marketingCost}
                    onChange={(e) => handleInputChange('marketingCost', e.target.value)}
                    placeholder="예: 2,000,000"
                  />
                </div>
                <div className="form-group">
                  <label>플랫폼 수수료 (%)</label>
                  <input
                    type="number"
                    value={pricingData.platformFee}
                    onChange={(e) => handleInputChange('platformFee', e.target.value)}
                    placeholder="예: 15"
                  />
                </div>
              </div>

              <div className="pricing-calculation">
                <div className="calc-item">
                  <label>총 비용:</label>
                  <span className="calc-value">{calculateTotalCost().toLocaleString()}원</span>
                </div>
              </div>

              <h3>가격 설정</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>제안 판매가 (원)</label>
                  <input
                    type="number"
                    value={pricingData.suggestedPrice}
                    onChange={(e) => handleInputChange('suggestedPrice', e.target.value)}
                    placeholder="예: 25,000"
                  />
                </div>
                <div className="form-group">
                  <label>목표 마진 (%)</label>
                  <input
                    type="number"
                    value={pricingData.targetMargin}
                    onChange={(e) => handleInputChange('targetMargin', e.target.value)}
                    placeholder="예: 30"
                  />
                </div>
              </div>

              <div className="pricing-calculation">
                <div className="calc-item">
                  <label>예상 수익 (수수료 제외):</label>
                  <span className="calc-value">{calculateExpectedRevenue().toLocaleString()}원</span>
                </div>
              </div>

              <div className="form-group full-width">
                <label>비고</label>
                <textarea
                  value={pricingData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="가격 산정 근거나 시장 분석 내용을 입력하세요..."
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleSavePricing}>
                  가격 측정 완료
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default PricingEvaluation;
