import React, { useState, useEffect, useCallback } from 'react';
import './GameDetailModal.css';
import { fetchLiveGameDetail, formatTrendApiError } from '../services/trendApiService';

const GameDetailModal = ({ gameId, isOpen, onClose, cachedGameDetail = null }) => {
  const [gameDetail, setGameDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (isOpen && gameId) {
      // 캐시된 데이터가 있으면 사용, 없으면 API 호출
      if (cachedGameDetail) {
        console.log('캐시된 데이터 사용:', cachedGameDetail);
        setGameDetail(cachedGameDetail);
        setLoading(false);
        setError(null);
      } else {
        fetchGameDetail();
      }
    }
  }, [isOpen, gameId, cachedGameDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGameDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('게임 상세 정보 조회 시작:', gameId);
      
      const result = await fetchLiveGameDetail(gameId);
      
      setGameDetail(result);
      console.log('게임 상세 정보 조회 완료:', result);
      
    } catch (err) {
      console.error('게임 상세 정보 조회 오류:', err);
      const userFriendlyError = formatTrendApiError(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const handleTranslate = async () => {
    if (!gameDetail || !gameDetail.description || translating) return;
    
    try {
      setTranslating(true);
      console.log('🔤 게임 설명 번역 시작:', gameId, '- 원본:', gameDetail.description.substring(0, 50) + '...');
      
      // Spring 백엔드를 통해 설명 번역 API 호출
      const response = await fetch('http://localhost:8080/api/trends/live/translate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: gameDetail.description
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data?.translated) {
          // 게임 설명만 번역된 내용으로 업데이트
          setGameDetail(prevDetail => ({
            ...prevDetail,
            description: result.data.translated,
            descriptionOriginal: gameDetail.description // 원본 보존
          }));
          console.log('✅ 게임 설명 번역 완료:', result.data.translated.substring(0, 50) + '...');
        } else {
          throw new Error(result.message || '번역 결과가 올바르지 않습니다.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `번역 API 호출 실패: ${response.status}`);
      }
      
    } catch (err) {
      console.error('게임 설명 번역 오류:', err);
      alert('게임 설명 번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTranslating(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setGameDetail(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const renderLoadingState = () => (
    <div className="modal-content loading">
      <div className="modal-header">
        <button className="close-button" onClick={handleClose}>×</button>
      </div>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>🎲 게임 상세 정보를 불러오는 중...</h3>
        <p>BoardGameGeek에서 데이터를 가져오고 있습니다</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="modal-content error">
      <div className="modal-header">
        <h2>오류 발생</h2>
        <button className="close-button" onClick={handleClose}>×</button>
      </div>
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-message">
          게임 상세 정보를 불러오는 중 오류가 발생했습니다:<br />
          {error}
        </div>
        <button className="retry-button" onClick={fetchGameDetail}>
          🔄 다시 시도
        </button>
      </div>
    </div>
  );

  const renderGameDetail = () => (
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="game-title">{gameDetail.name}</h2>
        <div className="header-actions">
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
      </div>
      
      <div className="modal-body">
        <div className="game-detail-layout">
          {/* 왼쪽: 이미지 및 기본 정보 */}
          <div className="game-image-section">
            {gameDetail.image && (
              <div className="game-image">
                <img 
                  src={gameDetail.image} 
                  alt={gameDetail.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="basic-info-card">
              <h4>📋 기본 정보</h4>
              <div className="info-grid">
                {gameDetail.yearPublished && (
                  <div className="info-item">
                    <span className="info-label">출시년도</span>
                    <span className="info-value">{gameDetail.yearPublished}년</span>
                  </div>
                )}
                
                {gameDetail.minPlayers && gameDetail.maxPlayers && (
                  <div className="info-item">
                    <span className="info-label">플레이어 수</span>
                    <span className="info-value">
                      {gameDetail.minPlayers === gameDetail.maxPlayers 
                        ? `${gameDetail.minPlayers}명` 
                        : `${gameDetail.minPlayers}-${gameDetail.maxPlayers}명`}
                    </span>
                  </div>
                )}
                
                {/* 플레이 시간 정보 개선 */}
                {(gameDetail.playingTime || gameDetail.minPlayTime) && (
                  <div className="info-item">
                    <span className="info-label">플레이 시간</span>
                    <span className="info-value">
                      {gameDetail.minPlayTime && gameDetail.maxPlayTime && gameDetail.minPlayTime !== gameDetail.maxPlayTime
                        ? `${gameDetail.minPlayTime}-${gameDetail.maxPlayTime}분`
                        : `${gameDetail.playingTime || gameDetail.minPlayTime}분`}
                    </span>
                  </div>
                )}
                
                {gameDetail.minAge && (
                  <div className="info-item">
                    <span className="info-label">최소 연령</span>
                    <span className="info-value">{gameDetail.minAge}세+</span>
                  </div>
                )}
                
                {/* BGG 순위 추가 */}
                {gameDetail.bggRank && (
                  <div className="info-item">
                    <span className="info-label">BGG 전체 순위</span>
                    <span className="info-value">#{gameDetail.bggRank}</span>
                  </div>
                )}
                
                {/* 베이즈 평균 추가 */}
                {gameDetail.bayesAverageRating && (
                  <div className="info-item">
                    <span className="info-label">베이즈 평균</span>
                    <span className="info-value">{Number(gameDetail.bayesAverageRating).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 상세 정보 */}
          <div className="game-info-section">
            {/* 평점 및 난이도 */}
            <div className="stats-section">
              <h4>📊 평가 정보</h4>
              <div className="stats-grid">
                {gameDetail.averageRating && (
                  <div className="stat-card rating">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                      <div className="stat-value">{Number(gameDetail.averageRating).toFixed(1)}</div>
                      <div className="stat-label">평균 평점</div>
                    </div>
                  </div>
                )}
                
                {gameDetail.averageWeight && (
                  <div className="stat-card complexity">
                    <div className="stat-icon">⚖️</div>
                    <div className="stat-content">
                      <div className="stat-value">{Number(gameDetail.averageWeight).toFixed(1)}</div>
                      <div className="stat-label">게임 난이도</div>
                    </div>
                  </div>
                )}
                
                {gameDetail.usersRated && (
                  <div className="stat-card users">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value">{gameDetail.usersRated.toLocaleString()}</div>
                      <div className="stat-label">평가 참여자</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 카테고리 */}
            {gameDetail.categories && gameDetail.categories.length > 0 && (
              <div className="categories-section">
                <h4>🎨 카테고리</h4>
                <div className="tags-container">
                  {gameDetail.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      #{category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 메카닉 */}
            {gameDetail.mechanics && gameDetail.mechanics.length > 0 && (
              <div className="mechanics-section">
                <h4>🔧 게임 메카닉</h4>
                <div className="tags-container">
                  {gameDetail.mechanics.map((mechanic, index) => (
                    <span key={index} className="mechanic-tag">
                      #{mechanic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 디자이너 및 출판사 */}
            <div className="credits-section">
              {gameDetail.designers && gameDetail.designers.length > 0 && (
                <div className="credit-item">
                  <h5>🎨 디자이너</h5>
                  <div className="credit-list">
                    {gameDetail.designers.join(', ')}
                  </div>
                </div>
              )}
              
              {gameDetail.publishers && gameDetail.publishers.length > 0 && (
                <div className="credit-item">
                  <h5>🏢 출판사</h5>
                  <div className="credit-list">
                    {gameDetail.publishers.slice(0, 3).join(', ')}
                    {gameDetail.publishers.length > 3 && ` 외 ${gameDetail.publishers.length - 3}개`}
                  </div>
                </div>
              )}
            </div>
            
            {/* 게임 설명 */}
            {gameDetail.description && (
              <div className="description-section">
                <div className="description-header">
                  <h4>📝 게임 설명</h4>
                  <button 
                    className={`translate-description-button ${translating ? 'translating' : ''}`}
                    onClick={handleTranslate}
                    disabled={translating}
                    title="게임 설명을 한국어로 번역"
                  >
                    {translating ? '🔄 번역 중...' : '🌐 한국어 번역'}
                  </button>
                </div>
                <div className="description-text">
                  {gameDetail.description.length > 300 
                    ? `${gameDetail.description.substring(0, 300)}...` 
                    : gameDetail.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="modal-footer">
        <div className="data-source">
          📊 데이터 출처: {gameDetail.source || 'BoardGameGeek'}
        </div>
        <button className="close-footer-button" onClick={handleClose}>
          닫기
        </button>
      </div>
    </div>
  );

  return (
    <div className="game-detail-modal" onClick={handleBackdropClick}>
      {loading && renderLoadingState()}
      {error && renderErrorState()}
      {gameDetail && !loading && !error && renderGameDetail()}
    </div>
  );
};

export default GameDetailModal;