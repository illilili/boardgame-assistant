// FinalApproval.jsx 최종 승인
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FinalApproval.css';

function FinalApproval() {
  const navigate = useNavigate();
  const [readyGames, setReadyGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [finalReview, setFinalReview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummyGames = [
      {
        id: 1,
        gameTitle: "할리갈리2",
        status: "PRICING_COMPLETED",
        gameDetails: {
          theme: "카드 게임",
          playerCount: "2-6명",
          playTime: "15분",
          difficulty: "쉬움"
        },
        translatedLanguages: ['영어', '일본어'],
        developer: { name: "김개발", specialty: "카드게임" },
        pricing: {
          totalCost: 7800000,
          suggestedPrice: 25000,
          expectedRevenue: 21250,
          targetMargin: 30
        },
        timeline: {
          submitted: "2024-01-15",
          approved: "2024-01-20",
          developerAssigned: "2024-01-21",
          translationCompleted: "2024-01-26",
          pricingCompleted: "2024-01-28"
        },
        finalStatus: "PENDING"
      },
      {
        id: 2,
        gameTitle: "할리갈리22",
        status: "PRICING_COMPLETED",
        gameDetails: {
          theme: "전략 게임",
          playerCount: "3-4명",
          playTime: "45분",
          difficulty: "보통"
        },
        translatedLanguages: ['영어', '중국어'],
        developer: { name: "박코딩", specialty: "보드게임" },
        pricing: {
          totalCost: 9200000,
          suggestedPrice: 35000,
          expectedRevenue: 29750,
          targetMargin: 35
        },
        timeline: {
          submitted: "2024-01-16",
          approved: "2024-01-21",
          developerAssigned: "2024-01-22",
          translationCompleted: "2024-01-27",
          pricingCompleted: "2024-01-29"
        },
        finalStatus: "FINAL_APPROVED"
      }
    ];

    setTimeout(() => {
      setReadyGames(dummyGames);
      setLoading(false);
    }, 500);
  }, []);

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setFinalReview('');
  };

  const handleFinalApprove = () => {
    if (!selectedGame) return;

    setReadyGames(prev =>
      prev.map(game =>
        game.id === selectedGame.id
          ? { ...game, finalStatus: 'FINAL_APPROVED', finalReview, approvedAt: new Date().toISOString().split('T')[0] }
          : game
      )
    );

    alert(`${selectedGame.gameTitle}이 최종 승인되었습니다! 출시 준비가 완료되었습니다.`);
    setSelectedGame(null);
    setFinalReview('');
  };

  const handleFinalReject = () => {
    if (!selectedGame) return;
    if (!finalReview.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    setReadyGames(prev =>
      prev.map(game =>
        game.id === selectedGame.id
          ? { ...game, finalStatus: 'FINAL_REJECTED', finalReview }
          : game
      )
    );

    alert(`${selectedGame.gameTitle}이 최종 반려되었습니다.`);
    setSelectedGame(null);
    setFinalReview('');
  };

  const calculateDaysFromSubmission = (submitted, completed) => {
    const start = new Date(submitted);
    const end = new Date(completed);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="final-approval-workspace">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
        </div>
        <ul className="workspace-nav-list">
          <li className="nav-item" onClick={() => navigate('/publishing')}>기획안 제출 목록</li>
          <li className="nav-item" onClick={() => navigate('/developer-assignment')}>개발자 배정</li>
          <li className="nav-item" onClick={() => navigate('/translation')}>번역</li>
          <li className="nav-item" onClick={() => navigate('/translation-review')}>번역 검토</li>
          <li className="nav-item" onClick={() => navigate('/pricing-evaluation')}>가격 평가</li>
          <li className="nav-item nav-header">최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="content-layout">
          <div className="submissions-grid">
            <h4>최종 승인 대기</h4>
            <div className="game-cards-grid">
              {readyGames.map((game) => (
                <div 
                  key={game.id} 
                  className={`game-card ${selectedGame?.id === game.id ? 'selected' : ''}`}
                  onClick={() => handleGameClick(game)}
                >
                  <div className="game-card-header">
                    <h3 className="game-title">{game.gameTitle}</h3>
                    <span className={`status-badge ${game.finalStatus.toLowerCase().replace('_', '-')}`}>
                      대기
                    </span>
                  </div>
                  <div className="game-card-content">
                    <p><strong>테마:</strong> {game.gameDetails.theme}</p>
                    <p><strong>플레이어:</strong> {game.gameDetails.playerCount}</p>
                    <p><strong>플레이 시간:</strong> {game.gameDetails.playTime}</p>
                    <p><strong>가격:</strong> ${game.pricing.suggestedPrice}</p>
                    <p className="approval-date"><strong>제출일:</strong> {game.readyAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-panel">
          {!selectedGame ? (
          <div className="welcome-screen">
            <div className="welcome-icon">✅</div>
            <h2>최종 승인</h2>
            <p>위 목록에서 게임을 선택하여 최종 검토 및 승인하세요.</p>
          </div>
        ) : (
          <div className="final-approval-content">
            <div className="game-summary-section">
              <h2>{selectedGame.gameTitle} - 최종 승인 검토</h2>
              
              <div className="summary-grid">
                <div className="summary-card">
                  <h3>게임 정보</h3>
                  <div className="info-list">
                    <p><strong>테마:</strong> {selectedGame.gameDetails.theme}</p>
                    <p><strong>플레이어:</strong> {selectedGame.gameDetails.playerCount}</p>
                    <p><strong>플레이 시간:</strong> {selectedGame.gameDetails.playTime}</p>
                    <p><strong>난이도:</strong> {selectedGame.gameDetails.difficulty}</p>
                  </div>
                </div>

                <div className="summary-card">
                  <h3>개발 정보</h3>
                  <div className="info-list">
                    <p><strong>담당 개발자:</strong> {selectedGame.developer.name}</p>
                    <p><strong>전문분야:</strong> {selectedGame.developer.specialty}</p>
                    <p><strong>번역 언어:</strong> {selectedGame.translatedLanguages.join(', ')}</p>
                  </div>
                </div>

                <div className="summary-card">
                  <h3>가격 정보</h3>
                  <div className="info-list">
                    <p><strong>총 개발비용:</strong> {selectedGame.pricing.totalCost.toLocaleString()}원</p>
                    <p><strong>제안 판매가:</strong> {selectedGame.pricing.suggestedPrice.toLocaleString()}원</p>
                    <p><strong>예상 수익:</strong> {selectedGame.pricing.expectedRevenue.toLocaleString()}원</p>
                    <p><strong>목표 마진:</strong> {selectedGame.pricing.targetMargin}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="timeline-section">
              <h3>프로젝트 진행 현황</h3>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>기획안 제출</h4>
                    <p>{selectedGame.timeline.submitted}</p>
                  </div>
                </div>
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>초기 승인</h4>
                    <p>{selectedGame.timeline.approved}</p>
                  </div>
                </div>
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>개발자 배정</h4>
                    <p>{selectedGame.timeline.developerAssigned}</p>
                  </div>
                </div>
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>번역 완료</h4>
                    <p>{selectedGame.timeline.translationCompleted}</p>
                  </div>
                </div>
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>가격 측정 완료</h4>
                    <p>{selectedGame.timeline.pricingCompleted}</p>
                  </div>
                </div>
                <div className="timeline-item current">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>최종 승인</h4>
                    <p>검토 중</p>
                  </div>
                </div>
              </div>
              <div className="timeline-summary">
                <p><strong>총 소요일:</strong> {calculateDaysFromSubmission(selectedGame.timeline.submitted, selectedGame.timeline.pricingCompleted)}일</p>
              </div>
            </div>

            <div className="final-review-section">
              <h3>최종 검토 의견</h3>
              <textarea
                value={finalReview}
                onChange={(e) => setFinalReview(e.target.value)}
                placeholder="최종 승인 또는 반려 사유를 입력하세요..."
                rows={4}
              />
              
              {selectedGame.finalStatus === 'PENDING' && (
                <div className="approval-actions">
                  <button 
                    className="final-approve-btn"
                    onClick={handleFinalApprove}
                  >
                    최종 승인 - 출시 진행
                  </button>
                  <button 
                    className="final-reject-btn"
                    onClick={handleFinalReject}
                  >
                    최종 반려
                  </button>
                </div>
              )}

              {selectedGame.finalStatus === 'FINAL_APPROVED' && (
                <div className="approval-result approved">
                  <h4>✅ 최종 승인 완료</h4>
                  <p>이 게임은 출시 준비가 완료되었습니다.</p>
                  {selectedGame.approvedAt && <p>승인일: {selectedGame.approvedAt}</p>}
                </div>
              )}

              {selectedGame.finalStatus === 'FINAL_REJECTED' && (
                <div className="approval-result rejected">
                  <h4>❌ 최종 반려</h4>
                  <p>이 게임은 최종 반려되었습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default FinalApproval;
