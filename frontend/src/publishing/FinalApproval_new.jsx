// FinalApproval.jsx 최종 승인
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FinalApproval.css';

function FinalApproval() {
  const navigate = useNavigate();
  const [readyGames, setReadyGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [approvalData, setApprovalData] = useState({
    finalPrice: '',
    releaseDate: '',
    marketingPlan: '',
    distributionChannels: [],
    approvalNotes: '',
    qualityChecked: false,
    legalChecked: false,
    marketingApproved: false
  });
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
        pricingInfo: {
          suggestedPrice: 15000,
          targetMargin: 40,
          totalCost: 800000
        },
        readyForApproval: true,
        approvalStatus: "PENDING"
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
        pricingInfo: {
          suggestedPrice: 25000,
          targetMargin: 35,
          totalCost: 1200000
        },
        readyForApproval: true,
        approvalStatus: "APPROVED"
      }
    ];

    setTimeout(() => {
      setReadyGames(dummyGames);
      setLoading(false);
    }, 500);
  }, []);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    
    // 이미 승인된 게임의 경우 기존 데이터 로드
    if (game.approvalStatus === 'APPROVED') {
      setApprovalData({
        finalPrice: '25000',
        releaseDate: '2024-03-15',
        marketingPlan: '소셜미디어 중심 마케팅 및 보드게임 카페 체험 이벤트',
        distributionChannels: ['steam', 'google-play', 'app-store'],
        approvalNotes: '모든 검토 완료. 출시 준비됨.',
        qualityChecked: true,
        legalChecked: true,
        marketingApproved: true
      });
    } else {
      setApprovalData({
        finalPrice: game.pricingInfo?.suggestedPrice?.toString() || '',
        releaseDate: '',
        marketingPlan: '',
        distributionChannels: [],
        approvalNotes: '',
        qualityChecked: false,
        legalChecked: false,
        marketingApproved: false
      });
    }
  };

  const handleInputChange = (field, value) => {
    setApprovalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChannelChange = (channel, checked) => {
    setApprovalData(prev => ({
      ...prev,
      distributionChannels: checked 
        ? [...prev.distributionChannels, channel]
        : prev.distributionChannels.filter(c => c !== channel)
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setApprovalData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const isReadyForApproval = () => {
    return approvalData.finalPrice && 
           approvalData.releaseDate && 
           approvalData.distributionChannels.length > 0 && 
           approvalData.qualityChecked && 
           approvalData.legalChecked && 
           approvalData.marketingApproved;
  };

  const submitApproval = () => {
    if (!selectedGame || !isReadyForApproval()) {
      alert('모든 필수 항목을 완료해주세요.');
      return;
    }

    // 실제로는 API 호출
    alert(`${selectedGame.gameTitle}이(가) 최종 승인되었습니다!`);
    
    // 상태 업데이트
    setReadyGames(prev => prev.map(game => 
      game.id === selectedGame.id 
        ? { ...game, approvalStatus: 'APPROVED' }
        : game
    ));
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return '대기중';
      case 'APPROVED': return '승인완료';
      case 'REJECTED': return '반려';
      default: return '대기중';
    }
  };

  const availableChannels = [
    { id: 'steam', name: 'Steam', icon: '🎮' },
    { id: 'google-play', name: 'Google Play', icon: '📱' },
    { id: 'app-store', name: 'App Store', icon: '🍎' },
    { id: 'board-game-geek', name: 'BoardGameGeek', icon: '🎲' },
    { id: 'retail-stores', name: '리테일 스토어', icon: '🏪' }
  ];

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="approval-workspace">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
        </div>
        <ul className="workspace-nav-list">
          <li className="nav-item" onClick={() => navigate('/publishing')}>기획안 제출 목록</li>
          <li className="nav-item" onClick={() => navigate('/developer-assignment')}>개발자 배정</li>
          <li className="nav-item" onClick={() => navigate('/translation')}>번역</li>
          <li className="nav-item" onClick={() => navigate('/translation-review')}>번역 검토</li>
          <li className="nav-item" onClick={() => navigate('/pricing-evaluation')}>가격 책정</li>
          <li className="nav-item nav-header">최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="creator-container">
          <div className="form-column">
            <div className="form-section">
              <h2>최종 승인 대기 중인 게임</h2>
              <div className="game-cards-grid">
                {readyGames.map(game => (
                  <div 
                    key={game.id}
                    className={`game-card ${selectedGame?.id === game.id ? 'selected' : ''}`}
                    onClick={() => handleGameSelect(game)}
                  >
                    <div className="game-card-header">
                      <h3 className="game-title">{game.gameTitle}</h3>
                      <span className={`status-badge ${game.approvalStatus.toLowerCase()}`}>
                        {getStatusText(game.approvalStatus)}
                      </span>
                    </div>
                    <div className="game-card-content">
                      <p><strong>테마:</strong> {game.gameDetails.theme}</p>
                      <p><strong>플레이어:</strong> {game.gameDetails.playerCount}</p>
                      <p><strong>제안가격:</strong> {game.pricingInfo.suggestedPrice?.toLocaleString()}원</p>
                      <p><strong>번역 언어:</strong> {game.translatedLanguages.join(', ')}</p>
                      <p><strong>목표 마진:</strong> {game.pricingInfo.targetMargin}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="result-column">
            {selectedGame ? (
              <div className="approval-management">
                <div className="selected-game-info">
                  <h3>{selectedGame.gameTitle}</h3>
                  <p><strong>상태:</strong> {getStatusText(selectedGame.approvalStatus)}</p>
                  <p><strong>제안 가격:</strong> {selectedGame.pricingInfo.suggestedPrice?.toLocaleString()}원</p>
                </div>

                <div className="approval-form">
                  <h4>출시 정보</h4>
                  
                  <div className="form-group">
                    <label>최종 판매가 (원)</label>
                    <input
                      type="number"
                      value={approvalData.finalPrice}
                      onChange={(e) => handleInputChange('finalPrice', e.target.value)}
                      placeholder="최종 판매가"
                    />
                  </div>

                  <div className="form-group">
                    <label>출시 예정일</label>
                    <input
                      type="date"
                      value={approvalData.releaseDate}
                      onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>유통 채널</label>
                    <div className="channels-grid">
                      {availableChannels.map(channel => (
                        <div key={channel.id} className="channel-item">
                          <label className="channel-label">
                            <input
                              type="checkbox"
                              checked={approvalData.distributionChannels.includes(channel.id)}
                              onChange={(e) => handleChannelChange(channel.id, e.target.checked)}
                            />
                            <span className="channel-icon">{channel.icon}</span>
                            <span className="channel-name">{channel.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>마케팅 계획</label>
                    <textarea
                      value={approvalData.marketingPlan}
                      onChange={(e) => handleInputChange('marketingPlan', e.target.value)}
                      placeholder="마케팅 전략과 계획을 입력하세요..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="approval-checklist">
                  <h4>승인 체크리스트</h4>
                  
                  <div className="checklist-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={approvalData.qualityChecked}
                        onChange={(e) => handleCheckboxChange('qualityChecked', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      품질 검토 완료
                    </label>
                  </div>

                  <div className="checklist-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={approvalData.legalChecked}
                        onChange={(e) => handleCheckboxChange('legalChecked', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      법적 검토 완료
                    </label>
                  </div>

                  <div className="checklist-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={approvalData.marketingApproved}
                        onChange={(e) => handleCheckboxChange('marketingApproved', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      마케팅 승인 완료
                    </label>
                  </div>
                </div>

                <div className="notes-section">
                  <label>승인 메모</label>
                  <textarea
                    value={approvalData.approvalNotes}
                    onChange={(e) => handleInputChange('approvalNotes', e.target.value)}
                    placeholder="승인에 대한 메모를 입력하세요..."
                    rows="3"
                  />
                </div>

                <div className="action-buttons">
                  <button 
                    className={`approve-btn ${isReadyForApproval() ? '' : 'disabled'}`}
                    onClick={submitApproval}
                    disabled={!isReadyForApproval()}
                  >
                    최종 승인
                  </button>
                </div>
              </div>
            ) : (
              <div className="welcome-screen">
                <div className="welcome-icon">✅</div>
                <h2>최종 승인 관리</h2>
                <p>게임을 선택하여 최종 검토를 완료하고 출시를 승인하세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default FinalApproval;
