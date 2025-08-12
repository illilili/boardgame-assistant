// WelcomeScreen.js
import React, { useState, useEffect } from 'react';
// MyPage 컴포넌트에서 사용하는 API 함수를 임시로 가져옵니다.
// 실제 프로젝트에서는 공통 API 모듈에서 가져와야 합니다.
import { getMyPageInfo as apiGetMyPageInfo } from '../api/auth.js';

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>사용자 정보 불러오는 중...</p>
    </div>
);

const WelcomeScreen = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyPageData = async () => {
            try {
                // API 호출을 통해 사용자 정보 가져오기
                const data = await apiGetMyPageInfo();
                setUserData(data);
            } catch (err) {
                setError(err.message || '사용자 정보를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyPageData();
    }, []);

    // 랭크 아이콘과 텍스트를 역할에 따라 동적으로 변경
    const getRoleInfo = (role) => {
        switch (role) {
            case 'PLANNER':
                return { icon: '📝', text: '기획자' };
            case 'DEVELOPER':
                return { icon: '💻', text: '개발자' };
            case 'PUBLISHER':
                return { icon: '📢', text: '퍼블리셔' };
            default:
                return { icon: '👤', text: '일반 사용자' };
        }
    };
    
    // 로딩 상태 처리
    if (loading) {
        return <LoadingSpinner />;
    }

    // 에러 상태 처리
    if (error) {
        return <div className="text-center mt-20 text-red-500">{error}</div>;
    }

    // userData가 정상적으로 로드된 경우
    const roleInfo = userData ? getRoleInfo(userData.role) : { icon: '👤', text: '사용자' };

    return (
        <>
            {/* 상단 통계 위젯 - 프로젝트 상태 요약 */}
            <div className="stats-container">
                <div className="stat-widget">
                    <p>진행 중인 프로젝트</p>
                    <h3>3</h3>
                </div>
                <div className="stat-widget">
                    <p>오늘 업데이트</p>
                    <h3>2</h3>
                </div>
                <div className="stat-widget">
                    <p>내 역할의 할 일</p>
                    <h3>5</h3>
                </div>
            </div>

            {/* 메인 대시보드 그리드 */}
            <div className="dashboard-main-grid">
                {/* 왼쪽 열 */}
                <div className="dashboard-col">
                    <div className="widget rank-widget">
                        <div className="rank-badge">
                            {/* 역할에 따른 동적 아이콘 */}
                            <div className="rank-icon">{roleInfo.icon}</div>
                            {/* 역할에 따른 동적 텍스트 */}
                            <span>{roleInfo.text}</span>
                        </div>
                        {/* 역할 정보 표시 */}
                        <p>현재 역할은 <strong>{roleInfo.text}</strong>입니다.</p>
                    </div>

                    <div className="widget progress-list-widget">
                        <div className="progress-info" style={{marginBottom: '20px'}}>
                            <p style={{fontSize: '1rem', fontWeight: '600'}}>나의 보드게임 개발 현황</p>
                            <span style={{fontWeight: '600'}}>목표: <strong style={{color: 'var(--text-on-active-nav)'}}>테스트 플레이 시작</strong></span>
                        </div>
                        <div className="progress-item">
                            <div className="progress-info">
                                <p>게임 컨셉 구체화</p>
                                <span>34%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress" style={{width: '34%'}}></div>
                            </div>
                        </div>
                        <div className="progress-item">
                            <div className="progress-info">
                                <p>메커니즘 프로토타입</p>
                                <span>82%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress" style={{width: '82%'}}></div>
                            </div>
                        </div>
                        <div className="progress-item">
                            <div className="progress-info">
                                <p>아트 스타일 스케치</p>
                                <span>50%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress" style={{width: '50%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 오른쪽 열 */}
                <div className="dashboard-col">
                    <div className="widget promo-widget-v2">
                        <h3>보드게임 만들기 2025</h3>
                        <p>7월 30일 ~ 8월 20일</p>
                        <button>자세히 보기</button>
                    </div>

                    <div className="widget event-list-widget">
                        <div className="event-item">
                            <div className="event-info">
                                <div className="event-icon">💡</div>
                                <div className="event-details">
                                    <p>프로젝트 '차원의 균열' 회의</p>
                                    <span>오늘, 오후 2시</span>
                                </div>
                            </div>
                            <div className="event-time">14:00</div>
                        </div>
                        <div className="event-item">
                            <div className="event-info">
                                <div className="event-icon">🎨</div>
                                <div className="event-details">
                                    <p>아트 스타일 피드백 세션</p>
                                    <span>내일, 오전 10시</span>
                                </div>
                            </div>
                            <div className="event-time">...</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomeScreen;
