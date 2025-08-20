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
      
      console.log('TOP 50 완전한 데이터 조회 시작...');
      
      const result = await fetchLiveTop50();
      
      setTop50Data(result);
      setLastUpdated(new Date());
      console.log('TOP 50 데이터 조회 완료:', result);
      
      // 게임 상세 정보 점진적 로딩 시작
      if (result.games && result.games.length > 0) {
        loadGameDetails(result.games);
      }
      
    } catch (err) {
      console.error('TOP 50 데이터 조회 오류:', err);
      const userFriendlyError = formatTrendApiError(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 없음 - 컴포넌트 마운트 시에만 실행

  useEffect(() => {
    fetchTop50Data();
  }, [fetchTop50Data]);

  // 게임 상세 정보를 배치로 로딩 - 성능 최적화
  const loadGameDetails = async (games) => {
    try {
      console.log('🚀 배치 로딩 시작:', games.length, '개 게임');
      
      // 이미 로딩된 게임들 제외
      const gamesNeedLoading = games.filter(game => 
        !detailsLoading.has(game.id) && !gameDetails.has(game.id)
      );
      
      if (gamesNeedLoading.length === 0) {
        console.log('전체 게임이 이미 로딩되었음');
        return;
      }
      
      // 20개씩 배치로 처리 (BGG API 안정성 고려)
      const batchSize = 20;
      const batches = [];
      
      for (let i = 0; i < gamesNeedLoading.length; i += batchSize) {
        const batchGames = gamesNeedLoading.slice(i, i + batchSize);
        batches.push(batchGames);
      }
      
      console.log(`${gamesNeedLoading.length}개 게임을 ${batches.length}개 배치로 처리`);
      
      // 배치 순차 처리
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const gameIds = batch.map(game => game.id);
        
        // 로딩 상태 설정
        batch.forEach(game => {
          setDetailsLoading(prev => new Set([...prev, game.id]));
        });
        
        try {
          console.log(`배치 ${batchIndex + 1}/${batches.length} 시작:`, gameIds);
          
          const batchResult = await fetchLiveGameDetailsBatch(gameIds);
          
          if (batchResult && batchResult.games) {
            console.log(`✅ 배치 ${batchIndex + 1} 성공: ${batchResult.games.length}/${gameIds.length}개`);
            
            // 성공한 게임들을 캐시에 저장
            batchResult.games.forEach(gameDetail => {
              if (gameDetail && gameDetail.id) {
                setGameDetails(prev => new Map([...prev, [gameDetail.id, gameDetail]]));
              }
            });
          } else {
            console.warn(`❌ 배치 ${batchIndex + 1} 데이터가 비어있음:`, batchResult);
          }
          
        } catch (batchError) {
          console.error(`❌ 배치 ${batchIndex + 1} 실패:`, batchError);
          
          // 배치 실패 시 개별 재시도 (폴백)
          console.log(`🔄 배치 실패로 개별 재시도: ${gameIds.length}개`);
          await loadGameDetailsIndividually(batch);
        }
        
        // 로딩 상태 제거
        batch.forEach(game => {
          setDetailsLoading(prev => {
            const newSet = new Set([...prev]);
            newSet.delete(game.id);
            return newSet;
          });
        });
        
        // 다음 배치 전 지연 (BGG API Rate Limit 고려)
        if (batchIndex < batches.length - 1) {
          console.log('다음 배치 전 3초 대기...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      console.log('✅ 모든 배치 로딩 완료');
      
    } catch (error) {
      console.error('배치 로딩 전체 실패:', error);
      // 전체 실패 시 기존 방식으로 폴백
      await loadGameDetailsIndividually(games);
    }
  };
  
  // 개별 로딩 (폴백용)
  const loadGameDetailsIndividually = async (games) => {
    console.log('🔄 개별 로딩 폴백 시작:', games.length, '개 게임');
    
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      
      if (detailsLoading.has(game.id) || gameDetails.has(game.id)) {
        continue;
      }
      
      try {
        setDetailsLoading(prev => new Set([...prev, game.id]));
        
        const gameDetail = await fetchLiveGameDetail(game.id);
        
        if (gameDetail && Object.keys(gameDetail).length > 0) {
          setGameDetails(prev => new Map([...prev, [game.id, gameDetail]]));
        }
        
      } catch (error) {
        console.warn(`개별 로딩 실패: ${game.id}`, error);
      } finally {
        setDetailsLoading(prev => {
          const newSet = new Set([...prev]);
          newSet.delete(game.id);
          return newSet;
        });
      }
      
      // 개별 로딩 간격
      if (i < games.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const renderLoadingState = () => (
    <div className="live-loading-container">
      <div className="live-loading-content">
        <div className="live-loading-spinner"></div>
        <h3>🔥 BoardGameGeek에서 실시간 데이터를 가져오는 중...</h3>
        <p>TOP 30 인기 게임의 상세 정보를 분석하고 있습니다</p>
        <div className="loading-steps">
          <div className="loading-step">📋 Hot List 조회</div>
          <div className="loading-step">🔍 상세 정보 수집</div>
          <div className="loading-step">📊 트렌드 분석</div>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="live-error-alert">
      <div className="error-icon">⚠️</div>
      <div className="error-message">
        실시간 데이터 조회 중 오류가 발생했습니다: {error}
      </div>
      <button 
        className="retry-button"
        onClick={fetchTop50Data}
      >
        🔄 다시 시도
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
          🔄 기존 인기 보드게임 분석
        </button>
      </div>
      
      <div className="header-content">
        <div className="title-section">
          <h1 className="main-title">
            📈 실시간 TOP 30 보드게임 트렌드 분석
          </h1>
          <p className="subtitle">
            BoardGameGeek 실시간 Hot List 기반 심층 시장 분석 대시보드
          </p>
        </div>
        
        <div className="data-meta-info">
          <div className="meta-item">
            <span className="meta-icon">📊</span>
            <span className="meta-label">데이터 소스</span>
            <span className="meta-value">BoardGameGeek API</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🎯</span>
            <span className="meta-label">분석 범위</span>
            <span className="meta-value">실시간 인기 상위 30개 게임</span>
          </div>
          {lastUpdated && (
            <div className="meta-item">
              <span className="meta-icon">🕒</span>
              <span className="meta-label">마지막 업데이트</span>
              <span className="meta-value">
                {lastUpdated.toLocaleString('ko-KR', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 게임 카드 클릭 핸들러
  const handleGameClick = (gameId) => {
    console.log('게임 카드 클릭:', gameId);
    setSelectedGameId(gameId);
    setIsModalOpen(true);
  };

  // 모달에서 사용할 게임 상세 정보 제공
  const getGameDetailForModal = (gameId) => {
    return gameDetails.get(gameId) || null;
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGameId(null);
  };


  // 전체 게임 번역 핸들러
  const handleTranslateAll = async () => {
    if (!top50Data?.games || translatingAll) return;
    
    try {
      setTranslatingAll(true);
      setTranslationProgress(`번역 준비 중... (${top50Data.games.length}개 게임)`);
      console.log('🔤 TOP 30 전체 번역 시작:', top50Data.games.length, '개 게임');
      
      // 기본 게임 정보에 이미 로드된 상세 정보 추가
      const gamesForTranslation = top50Data.games.map(game => {
        const details = gameDetails.get(game.id);
        return {
          id: game.id,
          name: game.name,
          yearPublished: game.yearPublished,
          // 상세 정보가 이미 로드되어 있다면 추가 (번역 효율성을 위해)
          ...(details && {
            categories: details.categories || [],
            mechanics: details.mechanics || [],
            description: details.description
          })
        };
      });
      
      console.log('번역할 게임 데이터:', gamesForTranslation.slice(0, 2)); // 처음 2개만 로깅
      console.log('전체 게임 수:', gamesForTranslation.length);
      console.log('translateAllGames 함수 호출 시작...');
      setTranslationProgress(`번역 진행 중...`);
      
      const result = await translateAllGames(gamesForTranslation);
      console.log('translateAllGames 결과:', result);
      
      if (result?.games) {
        console.log('✅ 번역 완료:', result.games.length, '개 게임');
        
        // 번역된 결과를 게임 상세 정보 캐시에 업데이트
        const translatedGameMap = new Map();
        result.games.forEach(translatedGame => {
          if (translatedGame && translatedGame.id) {
            translatedGameMap.set(translatedGame.id, translatedGame);
            
            // 기존 상세 정보와 번역 결과를 합치기
            const existingDetails = gameDetails.get(translatedGame.id) || {};
            const updatedDetails = {
              ...existingDetails,
              ...translatedGame,
              // 번역된 내용으로 덮어쓰기
              categories: translatedGame.categories || existingDetails.categories || [],
              mechanics: translatedGame.mechanics || existingDetails.mechanics || [],
              description: translatedGame.description || existingDetails.description
            };
            
            setGameDetails(prev => new Map([...prev, [translatedGame.id, updatedDetails]]));
          }
        });
        
        // top50Data.games도 번역된 내용으로 업데이트 (카테고리, 메카닉 정보 포함)
        setTop50Data(prevData => {
          if (!prevData?.games) return prevData;
          
          const updatedGames = prevData.games.map(game => {
            const translatedGame = translatedGameMap.get(game.id);
            if (translatedGame) {
              return {
                ...game,
                // 번역된 카테고리, 메카닉 추가 (기본 게임 정보는 유지)
                categories: translatedGame.categories || game.categories || [],
                mechanics: translatedGame.mechanics || game.mechanics || []
              };
            }
            return game;
          });
          
          console.log('🔄 top50Data.games 업데이트 완료:', updatedGames.length, '개 게임');
          console.log('업데이트된 마지막 게임:', updatedGames[updatedGames.length - 1]);
          
          return {
            ...prevData,
            games: updatedGames
          };
        });
        
        // 번역 완료 상태 설정
        setIsTranslated(true);
        setTranslationProgress('');
        
        console.log(`🎉 전체 번역 완료: ${result.successCount}개 성공, ${result.failureCount}개 실패`);
      }
      
    } catch (err) {
      console.error('전체 게임 번역 오류:', err);
      console.error('에러 메시지:', err.message);
      console.error('에러 스택:', err.stack);
      
      // 사용자에게 에러 메시지 표시 (임시로 alert 사용)
      alert(`번역 중 오류가 발생했습니다: ${err.message}`);
      
      // 번역 실패 시에도 기존 데이터는 유지
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
            <h2 className="section-title">🏆 TOP 30 랭킹</h2>
            <div className="section-actions">
              <button 
                className={`translate-all-button ${translatingAll ? 'translating' : ''} ${isTranslated ? 'translated' : ''}`}
                onClick={() => {
                  console.log('🚀 전체 번역 버튼 클릭됨!');
                  handleTranslateAll();
                }}
                disabled={translatingAll}
                title="전체 게임의 카테고리와 메카닉을 한국어로 번역"
              >
                {translatingAll 
                  ? (translationProgress || '🔄 번역 중...') 
                  : (isTranslated ? '✅ 번역 완료' : '🌐 전체 한국어 번역')
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
                
                {/* 게임 썸네일 - 더 크고 눈에 띄게 */}
                {game.thumbnail && (
                  <div className="game-thumbnail-large">
                    <img 
                      src={game.thumbnail} 
                      alt={game.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="game-info">
                  <h3 className="game-name">{game.name}</h3>
                  {game.yearPublished && (
                    <div className="game-year">({game.yearPublished})</div>
                  )}
                  
                  {/* 핵심 통계 정보 - 난이도, 인원수, 평점 */}
                  <div className="game-stats-new">
                    <div className="stat-item-compact">
                      <span className="stat-icon">⚖️</span>
                      <span className="stat-value">
                        {isLoadingDetails ? '...' : 
                         details?.averageWeight ? details.averageWeight.toFixed(1) : 'N/A'}
                      </span>
                      <span className="stat-label">난이도</span>
                    </div>
                    
                    <div className="stat-item-compact">
                      <span className="stat-icon">👥</span>
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
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">
                        {isLoadingDetails ? '...' : 
                         details?.averageRating ? details.averageRating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="stat-label">평점</span>
                    </div>
                  </div>
                  
                  {/* 카테고리 및 메카닉 태그 */}
                  <div className="game-tags-new">
                    {isLoadingDetails ? (
                      <div className="tags-loading">태그 로딩 중...</div>
                    ) : (
                      <>
                        {details?.categories?.slice(0, 2).map((category, idx) => (
                          <span key={`cat-${idx}`} className="game-tag category-tag">
                            #{category}
                          </span>
                        ))}
                        {details?.mechanics?.slice(0, 2).map((mechanic, idx) => (
                          <span key={`mech-${idx}`} className="game-tag mechanic-tag">
                            #{mechanic}
                          </span>
                        ))}
                        {!details && !isLoadingDetails && (
                          <span className="game-tag click-tag">
                            클릭하여 상세보기 →
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
        {/* 배경 */}
        <div className="live-background"></div>
        
        <div className="live-container">
        {renderHeader()}
        
        {/* 1단계: 실시간 트렌드 요약 */}
        <TrendSummaryCards 
          trendSummary={top50Data?.trendSummary} 
          isLoading={loading}
        />
        
        {/* 2단계: TOP 50 랭킹 */}
        {renderTOP50Cards()}
        
        {/* 3단계: 상세 정보 모달 */}
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