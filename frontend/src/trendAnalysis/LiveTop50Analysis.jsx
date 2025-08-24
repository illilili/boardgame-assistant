import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './LiveTop50Analysis.css';
import TrendSummaryCards from './components/TrendSummaryCards';
import GameDetailModal from './components/GameDetailModal';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { fetchLiveTop50, fetchLiveGameDetail, fetchLiveGameDetailsBatch, formatTrendApiError, translateAllGames } from './services/trendApiService';

const LiveTop50Analysis = () => {
  const navigate = useNavigate();
  const [top50Data, setTop50Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // 모달 상태 관리
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 게임 상세 정보 캐시 및 로딩 상태
  const [gameDetails, setGameDetails] = useState(new Map());
  const [detailsLoading, setDetailsLoading] = useState(new Set());
  
  // 전체 게임 번역 상태
  const [translatingAll, setTranslatingAll] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translationProgress, setTranslationProgress] = useState('');

  const fetchTop50Data = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('TOP 30 데이터 조회를 시작합니다...');
      
      const result = await fetchLiveTop50();
      
      setTop50Data(result);
      setLastUpdated(new Date());
      console.log('TOP 30 데이터 조회가 완료되었습니다:', result);
      
      // 게임 상세 정보 점진적 로딩 시작
      if (result.games && result.games.length > 0) {
        loadGameDetails(result.games);
      }
      
    } catch (err) {
      console.error('TOP 30 데이터 조회 중 오류가 발생했습니다:', err);
      const userFriendlyError = formatTrendApiError(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTop50Data();
  }, [fetchTop50Data]);

  // 게임 상세 정보를 배치로 로딩하여 성능 최적화
  const loadGameDetails = async (games) => {
    try {
      console.log('배치 로딩을 시작합니다:', games.length, '개 게임');
      
      const gamesNeedLoading = games.filter(game => 
        !detailsLoading.has(game.id) && !gameDetails.has(game.id)
      );
      
      if (gamesNeedLoading.length === 0) {
        console.log('모든 게임의 상세 정보가 이미 로드되었습니다.');
        return;
      }
      
      const batchSize = 20;
      const batches = [];
      
      for (let i = 0; i < gamesNeedLoading.length; i += batchSize) {
        batches.push(gamesNeedLoading.slice(i, i + batchSize));
      }
      
      console.log(`${gamesNeedLoading.length}개의 게임을 ${batches.length}개의 배치로 나누어 처리합니다.`);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const gameIds = batch.map(game => game.id);
        
        batch.forEach(game => {
          setDetailsLoading(prev => new Set(prev).add(game.id));
        });
        
        try {
          console.log(`배치 ${batchIndex + 1}/${batches.length} 처리를 시작합니다:`, gameIds);
          const batchResult = await fetchLiveGameDetailsBatch(gameIds);
          
          if (batchResult?.games) {
            console.log(`배치 ${batchIndex + 1} 처리 성공: ${batchResult.games.length}/${gameIds.length}개`);
            const newDetails = new Map();
            batchResult.games.forEach(gameDetail => {
              if (gameDetail?.id) {
                newDetails.set(gameDetail.id, gameDetail);
              }
            });
            setGameDetails(prev => new Map([...prev, ...newDetails]));
          } else {
            console.warn(`배치 ${batchIndex + 1} 처리 결과 데이터가 비어있습니다:`, batchResult);
          }
          
        } catch (batchError) {
          console.error(`배치 ${batchIndex + 1} 처리 중 오류가 발생했습니다:`, batchError);
          console.log(`배치 처리 실패로 인해 개별 재시도를 시작합니다: ${gameIds.length}개`);
          await loadGameDetailsIndividually(batch);
        }
        
        batch.forEach(game => {
          setDetailsLoading(prev => {
            const newSet = new Set(prev);
            newSet.delete(game.id);
            return newSet;
          });
        });
        
        if (batchIndex < batches.length - 1) {
          console.log('다음 배치 처리를 위해 3초 대기합니다...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      console.log('모든 배치 로딩이 완료되었습니다.');
      
    } catch (error) {
      console.error('배치 로딩 중 전체적인 오류가 발생했습니다:', error);
      await loadGameDetailsIndividually(games);
    }
  };
 
  // 개별 로딩 (폴백용)
  const loadGameDetailsIndividually = async (games) => {
    console.log('개별 로딩 폴백을 시작합니다:', games.length, '개 게임');
    for (const game of games) {
      if (detailsLoading.has(game.id) || gameDetails.has(game.id)) continue;
      
      try {
        setDetailsLoading(prev => new Set(prev).add(game.id));
        const gameDetail = await fetchLiveGameDetail(game.id);
        if (gameDetail && Object.keys(gameDetail).length > 0) {
          setGameDetails(prev => new Map(prev).set(game.id, gameDetail));
        }
      } catch (error) {
        console.warn(`개별 로딩 실패: ${game.id}`, error);
      } finally {
        setDetailsLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(game.id);
          return newSet;
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const renderLoadingState = () => (
    <div className="live-loading-container">
      <div className="live-loading-content">
        <div className="live-loading-spinner"></div>
        <h3>BoardGameGeek에서 실시간 데이터를 가져오는 중...</h3>
        <p>TOP 30 인기 게임의 상세 정보를 분석하고 있습니다</p>
        <div className="loading-steps">
          <div className="loading-step">Hot List 조회</div>
          <div className="loading-step">상세 정보 수집</div>
          <div className="loading-step">트렌드 분석</div>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="live-error-alert">
      <div className="error-icon-text">오류</div>
      <div className="error-message">
        실시간 데이터 조회 중 오류가 발생했습니다: {error}
      </div>
      <button 
        className="retry-button"
        onClick={fetchTop50Data}
      >
        다시 시도
      </button>
    </div>
  );

  const renderHeader = () => (
    <div className="live-dashboard-header">
      <div className="header-navigation">
        <button 
          className="back-button"
          onClick={() => navigate('/trend/original')}
        >
          기존 인기 보드게임 분석
        </button>
      </div>
      
      <div className="header-content">
        <div className="title-section">
          <h1 className="main-title">
            실시간 TOP 30 보드게임 트렌드 분석
          </h1>
          <p className="subtitle">
            BoardGameGeek 실시간 Hot List 기반 심층 시장 분석 대시보드
          </p>
        </div>
        
        <div className="data-meta-info">
          <div className="meta-item">
            <span className="meta-label">데이터 소스</span>
            <span className="meta-value">BoardGameGeek API</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">분석 범위</span>
            <span className="meta-value">실시간 인기 상위 30개 게임</span>
          </div>
          {lastUpdated && (
            <div className="meta-item">
              <span className="meta-label">마지막 업데이트</span>
              <span className="meta-value">
                {lastUpdated.toLocaleString('ko-KR', { 
                  year: 'numeric', month: '2-digit', day: '2-digit', 
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleGameClick = (gameId) => {
    console.log('게임 카드를 클릭했습니다:', gameId);
    setSelectedGameId(gameId);
    setIsModalOpen(true);
  };

  const getGameDetailForModal = (gameId) => gameDetails.get(gameId) || null;

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGameId(null);
  };

  const handleTranslateAll = async () => {
    if (!top50Data?.games || translatingAll) return;
    
    try {
      setTranslatingAll(true);
      setTranslationProgress(`번역 준비 중... (${top50Data.games.length}개)`);
      console.log('TOP 30 전체 번역을 시작합니다:', top50Data.games.length, '개 게임');
      
      const gamesForTranslation = top50Data.games.map(game => {
        const details = gameDetails.get(game.id);
        return {
          id: game.id,
          name: game.name,
          yearPublished: game.yearPublished,
          ...(details && {
            categories: details.categories || [],
            mechanics: details.mechanics || [],
            description: details.description
          })
        };
      });
      
      setTranslationProgress('번역 진행 중...');
      const result = await translateAllGames(gamesForTranslation);
      
      if (result?.games) {
        console.log('번역이 완료되었습니다:', result.games.length, '개 게임');
        
        const translatedGameMap = new Map(result.games.map(g => [g.id, g]));
        
        // 상세 정보 캐시 업데이트
        setGameDetails(prev => {
          const newDetails = new Map(prev);
          result.games.forEach(translatedGame => {
            const existingDetails = newDetails.get(translatedGame.id) || {};
            newDetails.set(translatedGame.id, { ...existingDetails, ...translatedGame });
          });
          return newDetails;
        });
        
        // 목록 데이터 업데이트
        setTop50Data(prevData => ({
          ...prevData,
          games: prevData.games.map(game => {
            const translatedGame = translatedGameMap.get(game.id);
            return translatedGame ? { ...game, ...translatedGame } : game;
          })
        }));
        
        setIsTranslated(true);
        console.log(`전체 번역 완료: ${result.successCount}개 성공, ${result.failureCount}개 실패`);
      }
    } catch (err) {
      console.error('전체 게임 번역 중 오류가 발생했습니다:', err);
      alert(`번역 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setTranslatingAll(false);
      setTranslationProgress('');
    }
  };

  const renderTOP50Cards = () => {
    if (!top50Data?.games || top50Data.games.length === 0) {
      return null;
    }

    return (
      <div className="top50-ranking-section">
        <div className="section-header">
          <div className="section-title-area">
            <h2 className="section-title">TOP 30 랭킹</h2>
            <div className="section-actions">
              <button 
                className={`translate-all-button ${translatingAll ? 'translating' : ''} ${isTranslated ? 'translated' : ''}`}
                onClick={handleTranslateAll}
                disabled={translatingAll}
                title="전체 게임의 카테고리와 메카닉을 한국어로 번역합니다."
              >
                {translatingAll 
                  ? (translationProgress || '번역 중...') 
                  : (isTranslated ? '번역 완료' : '전체 한국어 번역')
                }
              </button>
            </div>
          </div>
          <p className="section-subtitle">
            각 게임을 클릭하면 상세 정보를 볼 수 있습니다
          </p>
        </div>
        
        <div className="top50-grid">
          {top50Data.games.map((game, index) => {
            const details = gameDetails.get(game.id);
            const isLoadingDetails = detailsLoading.has(game.id);

            return (
              <div 
                key={game.id || index} 
                className="game-card clickable"
                onClick={() => handleGameClick(game.id)}
              >
                <div className="game-rank">#{game.rank || index + 1}</div>
                
                {game.thumbnail && (
                  <div className="game-thumbnail-large">
                    <img 
                      src={game.thumbnail} 
                      alt={`${game.name} 썸네일`}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                
                <div className="game-info">
                  <h3 className="game-name">{game.name}</h3>
                  {game.yearPublished && (
                    <div className="game-year">({game.yearPublished})</div>
                  )}
                  
                  <div className="game-stats-new">
                    <div className="stat-item-compact">
                      <span className="stat-value">
                        {isLoadingDetails ? '...' : details?.averageWeight ? details.averageWeight.toFixed(1) : 'N/A'}
                      </span>
                      <span className="stat-label">난이도</span>
                    </div>
                    
                    <div className="stat-item-compact">
                      <span className="stat-value">
                        {isLoadingDetails ? '...' : 
                          details?.minPlayers && details?.maxPlayers ? 
                          (details.minPlayers === details.maxPlayers ? 
                           `${details.minPlayers}명` : 
                           `${details.minPlayers}-${details.maxPlayers}명`) : 
                          'N/A'}
                      </span>
                      <span className="stat-label">인원</span>
                    </div>
                    
                    <div className="stat-item-compact">
                      <span className="stat-value">
                        {isLoadingDetails ? '...' : details?.averageRating ? details.averageRating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="stat-label">평점</span>
                    </div>
                  </div>
                  
                  <div className="game-tags-new">
                    {isLoadingDetails ? (
                      <div className="tags-loading">태그 로딩 중...</div>
                    ) : (
                      <>
                        {(details?.categories || game.categories)?.slice(0, 2).map((category, idx) => (
                          <span key={`cat-${idx}`} className="game-tag category-tag">
                            #{category}
                          </span>
                        ))}
                        {(details?.mechanics || game.mechanics)?.slice(0, 2).map((mechanic, idx) => (
                          <span key={`mech-${idx}`} className="game-tag mechanic-tag">
                            #{mechanic}
                          </span>
                        ))}
                        {!details && !isLoadingDetails && (
                          <span className="game-tag click-tag">
                            클릭하여 상세보기
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <>
      <Header projectMode={false} />
      <div className="live-top50-analysis">
        <div className="live-background"></div>
        
        <div className="live-container">
          {renderHeader()}
          
          <TrendSummaryCards 
            trendSummary={top50Data?.trendSummary} 
            isLoading={loading}
          />
          
          {renderTOP50Cards()}
          
          <GameDetailModal 
            gameId={selectedGameId}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            cachedGameDetail={selectedGameId ? getGameDetailForModal(selectedGameId) : null}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LiveTop50Analysis;
