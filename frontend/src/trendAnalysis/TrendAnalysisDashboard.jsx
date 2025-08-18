import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrendAnalysisDashboard.css';
import TrendSummaryCards from './components/TrendSummaryCards';
import { fetchAllOriginalData, formatTrendApiError } from './services/trendApiService';

// Plotly 동적 로딩
let Plotly = null;
const loadPlotly = async () => {
  if (!Plotly) {
    Plotly = await import('plotly.js-dist-min');
  }
  return Plotly;
};

const TrendAnalysisDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [liveTrendingData, setLiveTrendingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 모던 차트 색상 팔레트
  const COLORS = {
    primary: [
      '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', 
      '#f59e0b', '#ef4444', '#84cc16', '#f97316', '#8b5cf6'
    ],
    difficulty: {
      '쉬움': '#10b981',      // 연한 녹색
      '보통': '#f59e0b',      // 주황색
      '어려움': '#ef4444',    // 빨간색
      '매우 어려움': '#8b5cf6' // 보라색
    },
    players: {
      '1 Player': '#6366f1',
      '2 Players': '#10b981',
      '3-4 Players': '#f59e0b',
      '5-6 Players': '#ec4899',
      '7+ Players': '#06b6d4'
    },
    gradients: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ]
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // 새로운 API 서비스 사용
      const allData = await fetchAllOriginalData();
      
      setDashboardData(allData.dashboard);
      setRealtimeData(allData.health);
      setError(null);
      
    } catch (err) {
      console.error('데이터 조회 오류:', err);
      const userFriendlyError = formatTrendApiError(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  // BoardGameGeek 실시간 트렌딩 데이터 조회
  const fetchLiveTrendingData = async () => {
    try {
      setLiveLoading(true);
      
      const { fetchLiveTop50 } = await import('./services/trendApiService');
      const liveData = await fetchLiveTop50();
      
      setLiveTrendingData(liveData);
      console.log('BoardGameGeek 실시간 데이터 업데이트 완료');
      
    } catch (err) {
      console.error('BGG 실시간 데이터 조회 오류:', err);
      const userFriendlyError = formatTrendApiError(err);
      alert('BoardGameGeek 실시간 데이터 조회 실패: ' + userFriendlyError);
    } finally {
      setLiveLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h3>✨ 트렌드 데이터를 분석하는 중...</h3>
        <p>10,000개의 보드게임 데이터를 처리하고 있습니다</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="error-alert">
      <div className="error-icon">⚠️</div>
      <div className="error-message">
        데이터 로딩 중 오류가 발생했습니다: {error}
      </div>
    </div>
  );

  const renderRealtimeInfo = () => {
    const currentData = liveTrendingData || realtimeData;
    if (!currentData) return null;
    
    const isLiveData = !!liveTrendingData;
    const dataSource = currentData.source || 'Unknown';
    
    return (
      <div className="realtime-card">
        <div className="realtime-header">
          <div className="realtime-title-section">
            <h3 className="realtime-title">
              {isLiveData ? '🔥' : '⚡'} {isLiveData ? 'BoardGameGeek 실시간 트렌딩' : '실시간 보드게임 데이터'}
            </h3>
            <span className="data-source">📊 {dataSource}</span>
          </div>
          <button 
            className={`live-refresh-btn ${liveLoading ? 'loading' : ''}`}
            onClick={fetchLiveTrendingData}
            disabled={liveLoading}
          >
            {liveLoading ? (
              <>
                <div className="btn-spinner"></div>
                조회 중...
              </>
            ) : (
              <>
                🌍 BGG 실시간 조회
              </>
            )}
          </button>
        </div>
        <div className="realtime-content">
          {/* 통계 정보 */}
          <div className="stats-grid">
            {Object.entries(currentData.quickStats || {}).map(([key, value]) => (
              <div key={key} className="stat-item">
                <div className="stat-value">{value?.toLocaleString()}</div>
                <div className="stat-label">{key}</div>
              </div>
            ))}
          </div>
          
          {/* 인기 게임 - BGG 데이터인 경우 hotGames, 내부 데이터인 경우 popularGames */}
          <div className="popular-games">
            <h4 className="section-title">
              {isLiveData ? '🔥 BGG 인기 게임' : '🏆 인기 게임 TOP 3'}
            </h4>
            <div className="games-list">
              {(currentData.hotGames || currentData.popularGames || []).slice(0, 5).map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-info">
                    <span className="game-name">{game.name}</span>
                    <div className="game-details">
                      {game.rank && <span className="game-rank">#{game.rank}</span>}
                      {game.minPlayers && game.maxPlayers && (
                        <span className="game-players">{game.minPlayers}-{game.maxPlayers}명</span>
                      )}
                      {game.yearPublished && (
                        <span className="game-year">({game.yearPublished})</span>
                      )}
                    </div>
                  </div>
                  {game.rating && (
                    <div className="game-rating">
                      ★ {Number(game.rating).toFixed(1)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* 최신 게임 - 내부 데이터에만 있음 */}
          {!isLiveData && currentData.recentGames && (
            <div className="recent-games">
              <h4 className="section-title">🆕 최근 게임 5개</h4>
              <div className="games-list">
                {currentData.recentGames.slice(0, 3).map((game, index) => (
                  <div key={index} className="game-item">
                    <div className="game-info">
                      <span className="game-name">{game.name}</span>
                      <span className="game-weight">난이도: {Number(game.averageWeight || 0).toFixed(1)}</span>
                    </div>
                    <div className="game-rating">
                      ★ {Number(game.rating || 0).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="last-updated">
            마지막 업데이트: {new Date(currentData.lastUpdated || currentData.lastFetched).toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    );
  };

  const renderThemesChart = () => {
    if (!dashboardData?.themes) return null;

    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">
            📈 인기 테마 TOP 10
          </h3>
          <p className="chart-description">
            보드게임 시장에서 가장 인기 있는 테마들
          </p>
        </div>
        <div className="chart-content">
          <div id="themes-chart" style={{ width: '100%', height: '500px' }}></div>
          
          {/* 테마 목록 */}
          <div className="themes-grid">
            {dashboardData.themes.slice(0, 6).map((theme, index) => (
              <div key={theme.theme} className="theme-item">
                <span className="theme-name">{theme.theme}</span>
                <span className="theme-percentage">{theme.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDifficultyChart = () => {
    if (!dashboardData?.difficulty) return null;

    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">🎯 게임 난이도 분포</h3>
          <p className="chart-description">
            Average Weight 기준 난이도별 게임 분포
          </p>
        </div>
        <div className="chart-content">
          <div id="difficulty-chart" style={{ width: '100%', height: '400px' }}></div>
          
          {/* 난이도 상세 정보 */}
          <div className="difficulty-details">
            {dashboardData.difficulty.map((item, index) => (
              <div key={item.level} className="difficulty-item">
                <div className="difficulty-info">
                  <div 
                    className="difficulty-color"
                    style={{ backgroundColor: COLORS.difficulty[item.level] }}
                  />
                  <span className="difficulty-level">{item.level}</span>
                  <span className="difficulty-weight">
                    (평균: {item.averageWeight})
                  </span>
                </div>
                <div className="difficulty-stats">
                  <div className="difficulty-count">{item.count.toLocaleString()}개</div>
                  <div className="difficulty-percentage">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPlayerCountChart = () => {
    if (!dashboardData?.players) return null;

    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">
            👥 플레이어 수 분포
          </h3>
          <p className="chart-description">
            게임별 권장 플레이어 수 분포
          </p>
        </div>
        <div className="chart-content">
          <div id="players-chart" style={{ width: '100%', height: '400px' }}></div>
          
          {/* 플레이어 수 상세 정보 */}
          <div className="players-details">
            {dashboardData.players.map((item) => (
              <div key={item.playerRange} className="player-item">
                <div className="player-info">
                  <div className="player-range">{item.playerRange}</div>
                  <div className="player-description">{item.description}</div>
                </div>
                <div className="player-stats">
                  <div className="player-count">{item.count.toLocaleString()}개</div>
                  <div className="player-percentage">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 탭 상태는 위에서 선언됨

  // 차트 생성 useEffect
  useEffect(() => {
    if (!dashboardData) return;

    const createCharts = async () => {
      const PlotlyModule = await loadPlotly();
      const Plotly = PlotlyModule.default || PlotlyModule;

      // 테마 차트
      if (dashboardData.themes && document.getElementById('themes-chart')) {
        const themesData = [{
          x: dashboardData.themes.map(item => item.percentage),
          y: dashboardData.themes.map(item => item.theme),
          type: 'bar',
          orientation: 'h',
          marker: { 
            color: dashboardData.themes.map((_, index) => COLORS.primary[index % COLORS.primary.length]),
            line: { color: 'rgba(255, 255, 255, 0.2)', width: 2 }
          },
          name: '비율 (%)',
          text: dashboardData.themes.map(item => `${item.percentage}%`),
          textposition: 'auto',
          hovertemplate: '<b>%{y}</b><br>비율: %{x}%<br>게임 수: %{customdata}<extra></extra>',
          customdata: dashboardData.themes.map(item => item.count.toLocaleString())
        }];

        const themesLayout = {
          title: { 
            text: '🎨 인기 테마 TOP 10', 
            font: { size: 18, color: '#1f2937', family: 'Noto Sans KR' },
            x: 0.5,
            xanchor: 'center'
          },
          xaxis: { 
            title: '비율 (%)', 
            gridcolor: '#f1f5f9',
            tickfont: { color: '#6b7280' },
            titlefont: { color: '#374151', size: 14 }
          },
          yaxis: { 
            title: '', 
            gridcolor: '#f1f5f9',
            tickfont: { color: '#374151', size: 12 }
          },
          margin: { l: 160, r: 40, t: 80, b: 60 },
          paper_bgcolor: 'rgba(255, 255, 255, 0)',
          plot_bgcolor: 'rgba(255, 255, 255, 0)',
          showlegend: false,
          font: { family: 'Noto Sans KR' }
        };

        Plotly.newPlot('themes-chart', themesData, themesLayout, { 
          displayModeBar: false, 
          responsive: true,
          config: { displaylogo: false }
        }).then(() => {
          // 차트 애니메이션 효과
          Plotly.animate('themes-chart', {
            data: themesData,
            traces: [0],
            layout: {}
          }, {
            transition: { duration: 1000, easing: 'cubic-in-out' },
            frame: { duration: 1000, redraw: false }
          });
        });
      }

      // 난이도 차트
      if (dashboardData.difficulty && document.getElementById('difficulty-chart')) {
        const difficultyData = [{
          values: dashboardData.difficulty.map(item => item.count),
          labels: dashboardData.difficulty.map(item => item.level),
          type: 'pie',
          marker: { 
            colors: dashboardData.difficulty.map(item => COLORS.difficulty[item.level] || '#6366f1'),
            line: { color: 'rgba(255, 255, 255, 0.8)', width: 3 }
          },
          textinfo: 'label+percent',
          textposition: 'auto',
          textfont: { size: 14, color: 'white', family: 'Noto Sans KR' },
          name: '게임 수',
          hole: 0.4,
          hovertemplate: '<b>%{label}</b><br>게임 수: %{value:,}<br>비율: %{percent}<extra></extra>',
          pull: [0.05, 0.05, 0.05, 0.05]
        }];

        const difficultyLayout = {
          title: { 
            text: '🎯 게임 난이도 분포', 
            font: { size: 18, color: '#1f2937', family: 'Noto Sans KR' },
            x: 0.5,
            xanchor: 'center'
          },
          margin: { l: 40, r: 40, t: 80, b: 40 },
          paper_bgcolor: 'rgba(255, 255, 255, 0)',
          plot_bgcolor: 'rgba(255, 255, 255, 0)',
          showlegend: true,
          legend: {
            orientation: "v",
            x: 1.02,
            xanchor: 'left',
            font: { family: 'Noto Sans KR', size: 12, color: '#374151' }
          },
          font: { family: 'Noto Sans KR' },
          annotations: [{
            text: `총 ${dashboardData.difficulty.reduce((sum, item) => sum + item.count, 0).toLocaleString()}개`,
            showarrow: false,
            font: { size: 16, color: '#6366f1', family: 'Noto Sans KR' },
            x: 0.5,
            y: 0.5
          }]
        };

        Plotly.newPlot('difficulty-chart', difficultyData, difficultyLayout, { 
          displayModeBar: false, 
          responsive: true,
          config: { displaylogo: false }
        }).then(() => {
          // 도넛 차트 애니메이션
          Plotly.animate('difficulty-chart', {
            data: difficultyData,
            traces: [0],
            layout: {}
          }, {
            transition: { duration: 1200, easing: 'elastic-out' },
            frame: { duration: 1200, redraw: false }
          });
        });
      }

      // 플레이어 수 차트  
      if (dashboardData.players && document.getElementById('players-chart')) {
        const playersData = [{
          x: dashboardData.players.map(item => item.playerRange),
          y: dashboardData.players.map(item => item.count),
          type: 'bar',
          marker: { 
            color: dashboardData.players.map(item => COLORS.players[item.playerRange] || '#6366f1'),
            line: { color: 'rgba(255, 255, 255, 0.2)', width: 2 }
          },
          name: '게임 수',
          text: dashboardData.players.map(item => `${item.percentage}%`),
          textposition: 'auto',
          textfont: { size: 12, color: 'white', family: 'Noto Sans KR' },
          hovertemplate: '<b>%{x}</b><br>게임 수: %{y:,}<br>비율: %{customdata}%<extra></extra>',
          customdata: dashboardData.players.map(item => item.percentage)
        }];

        const playersLayout = {
          title: { 
            text: '👥 플레이어 수별 게임 분포', 
            font: { size: 18, color: '#1f2937', family: 'Noto Sans KR' },
            x: 0.5,
            xanchor: 'center'
          },
          xaxis: { 
            title: '플레이어 수', 
            gridcolor: '#f1f5f9',
            tickfont: { color: '#374151', size: 12 },
            titlefont: { color: '#374151', size: 14 }
          },
          yaxis: { 
            title: '게임 수', 
            gridcolor: '#f1f5f9',
            tickfont: { color: '#6b7280' },
            titlefont: { color: '#374151', size: 14 }
          },
          margin: { l: 70, r: 40, t: 80, b: 100 },
          paper_bgcolor: 'rgba(255, 255, 255, 0)',
          plot_bgcolor: 'rgba(255, 255, 255, 0)',
          showlegend: false,
          font: { family: 'Noto Sans KR' },
          bargap: 0.1
        };

        Plotly.newPlot('players-chart', playersData, playersLayout, { 
          displayModeBar: false, 
          responsive: true,
          config: { displaylogo: false }
        }).then(() => {
          // 바 차트 애니메이션
          Plotly.animate('players-chart', {
            data: playersData,
            traces: [0],
            layout: {}
          }, {
            transition: { duration: 1000, easing: 'bounce-out' },
            frame: { duration: 1000, redraw: false }
          });
        });
      }
    };

    setTimeout(createCharts, 100);
  }, [dashboardData]);

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <div className="trend-dashboard">
      {/* 헤더 */}
      <div className="dashboard-header">
        <button 
          className="back-button"
          onClick={() => navigate('/trend')}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← 돌아가기
        </button>
        <h1 className="dashboard-title">📊 기존 인기 보드게임 분석</h1>
        <p className="dashboard-subtitle">
          BoardGameGeek 10,000개 게임 데이터 기반 심층 시장 분석
        </p>
      </div>

      {/* 실시간 데이터 */}
      {renderRealtimeInfo()}

      {/* 탭 네비게이션 - 상단 가로 배치 */}
      <div className="horizontal-tabs">
        <div className="horizontal-tab-buttons">
          <button 
            className={`horizontal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 전체 개요
          </button>
          <button 
            className={`horizontal-tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            🎨 인기 테마
          </button>
          <button 
            className={`horizontal-tab-btn ${activeTab === 'difficulty' ? 'active' : ''}`}
            onClick={() => setActiveTab('difficulty')}
          >
            🎯 난이도 분석
          </button>
          <button 
            className={`horizontal-tab-btn ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            👥 플레이어 수
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="horizontal-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="main-chart-area">
              {renderThemesChart()}
              {renderPlayerCountChart()}
            </div>
            <div className="side-chart-area">
              {renderDifficultyChart()}
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="themes-content">
            {renderThemesChart()}
          </div>
        )}

        {activeTab === 'difficulty' && (
          <div className="difficulty-content">
            {renderDifficultyChart()}
          </div>
        )}

        {activeTab === 'players' && (
          <div className="players-content">
            {renderPlayerCountChart()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendAnalysisDashboard;