import React from 'react';
import './TrendSummaryCards.css';

const TrendSummaryCards = ({ trendSummary, isLoading }) => {
    if (isLoading) {
        return (
            <div className="trend-summary-cards">
                <div className="trend-summary-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="trend-card loading-card">
                            <div className="loading-shimmer"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!trendSummary) {
        return null;
    }

    const {
        averageComplexity = 0,
        popularPlayerCount = 0,
        mainGenre = '데이터 없음',
        hotMechanic = '데이터 없음',
        topGenres = [],
        topMechanics = [],
        totalGames = 0,
        averageRating = 0
    } = trendSummary;

    // TOP3 데이터 준비 (백엔드에서 이미 번역된 데이터 사용)
    const displayGenres = topGenres.length > 0 
        ? topGenres.slice(0, 3)
        : [mainGenre || '데이터 없음'];
    
    const displayMechanics = topMechanics.length > 0 
        ? topMechanics.slice(0, 3)
        : [hotMechanic || '데이터 없음'];

    return (
        <div className="trend-summary-cards">
            <div className="trend-summary-header">
                <h2 className="section-title">
                    실시간 트렌드 요약
                </h2>
                <p className="section-subtitle">
                    TOP {totalGames}개 게임으로 분석한 현재 보드게임 트렌드
                </p>
            </div>
            
            <div className="trend-summary-grid">
                {/* 평균 게임 난이도 */}
                <div className="trend-card complexity-card">
                    <div className="card-icon-wrapper">
                        <div className="card-icon complexity-icon"></div>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{averageComplexity.toFixed(2)}</div>
                        <div className="card-label">평균 게임 난이도</div>
                        <div className="card-description">
                            {averageComplexity >= 3.5 ? '전략적 깊이가 있는 게임 선호' : 
                             averageComplexity >= 2.5 ? '균형 잡힌 난이도 선호' : '쉽고 빠르게 즐기는 게임 선호'}
                        </div>
                    </div>
                </div>

                {/* 가장 인기있는 인원 */}
                <div className="trend-card players-card">
                    <div className="card-icon-wrapper">
                         <div className="card-icon players-icon"></div>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{popularPlayerCount}인</div>
                        <div className="card-label">가장 인기있는 인원</div>
                        <div className="card-description">
                            {popularPlayerCount <= 2 ? '1-2인 플레이에 집중' :
                             popularPlayerCount <= 4 ? '소규모 그룹 플레이가 대세' : '다인원 파티 게임 인기'}
                        </div>
                    </div>
                </div>

                {/* 주류 장르 TOP3 */}
                <div className="trend-card genre-card">
                    <div className="card-icon-wrapper">
                        <div className="card-icon genre-icon"></div>
                    </div>
                    <div className="card-content">
                        <div className="card-label">주류 장르 TOP {displayGenres.length}</div>
                        <div className="card-value-list">
                            {displayGenres.map((genre, index) => (
                                <div key={genre} className="card-value-item">
                                    <span className="rank-number">{index + 1}</span>
                                    <span className="item-name">{genre}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 뜨거운 메카닉 TOP3 */}
                <div className="trend-card mechanic-card">
                    <div className="card-icon-wrapper">
                        <div className="card-icon mechanic-icon"></div>
                    </div>
                    <div className="card-content">
                        <div className="card-label">뜨거운 메카닉 TOP {displayMechanics.length}</div>
                        <div className="card-value-list">
                            {displayMechanics.map((mechanic, index) => (
                                <div key={mechanic} className="card-value-item">
                                    <span className="rank-number">{index + 1}</span>
                                    <span className="item-name">{mechanic}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 추가 통계 */}
            <div className="trend-summary-stats">
                <div className="stat-item">
                    <span className="stat-label">평균 평점</span>
                    <span className="stat-value">{averageRating.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">분석 게임 수</span>
                    <span className="stat-value">{totalGames}개</span>
                </div>
            </div>
        </div>
    );
};

export default TrendSummaryCards;
