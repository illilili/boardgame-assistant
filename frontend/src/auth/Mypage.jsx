// src/mypage/MyPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPageInfo } from '../api/auth.js';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { FaUserCircle, FaEdit, FaKey, FaEnvelope, FaBuilding, FaUserTag } from 'react-icons/fa';
// ✨ CSS 파일 임포트 경로 확인
import './MyPage.css';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

const MyPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyPageData = async () => {
            try {
                const data = await getMyPageInfo();
                setUserData(data);
            } catch (err) {
                setError(err.message || '마이페이지 정보를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyPageData();
    }, []);

    if (loading) {
        // ✨ [BEM 적용] 로딩 상태 컨테이너 클래스 변경
        return (
            <div className="mypage-status-container">
                <div className="mypage-spinner"></div>
                <p>데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        // ✨ [BEM 적용] 에러 상태 컨테이너 클래스 변경
        return <div className="mypage-status-container mypage-status-container--error">{error}</div>;
    }

    if (!userData) return null;

    return (
        <>
            <Header />
            {/* ✨ [BEM 적용] mypage 블록 시작 */}
            <div className="mypage">
                <div className="mypage__layout">
                    <aside className="mypage__sidebar">
                        <div className="mypage__profile-card">
                            <FaUserCircle className="mypage__avatar" />
                            <h2 className="mypage__user-name">{userData.userName}</h2>
                            
                            <div className="mypage__info-group">
                                <div className="mypage__info-item">
                                    <FaEnvelope className="mypage__info-icon" />
                                    <span>{userData.email}</span>
                                </div>
                                <div className="mypage__info-item">
                                    <FaBuilding className="mypage__info-icon" />
                                    <span>{userData.company || '회사 정보 미입력'}</span>
                                </div>
                            </div>
                            <div className="mypage__role-badge">
                                <FaUserTag className="mypage__role-icon" />
                                <span>{userData.role}</span>
                            </div>
                        </div>
                    </aside>

                    <main className="mypage__main-content">
                        <section className="mypage__section">
                            <div className="mypage__section-header">
                                <h1 className="mypage__section-title">참여중인 프로젝트</h1>
                                <span className="mypage__project-count">
                                    {userData.participatingProjects.length}개
                                </span>
                            </div>
                            
                            {userData.participatingProjects.length > 0 ? (
                                <div className="mypage__project-grid">
                                    {userData.participatingProjects.map(project => (
                                        // ✨ [BEM 적용] 프로젝트 카드 클래스 이름 완전 변경
                                        <div
                                            key={project.projectId}
                                            className="mypage-project-card"
                                            onClick={() => navigate(`/projects/${project.projectId}`)}
                                        >
                                            <img
                                                src={project.thumbnailUrl || DEFAULT_THUMBNAIL}
                                                alt={`${project.projectName} 썸네일`}
                                                className="mypage-project-card__thumbnail"
                                            />
                                            <div className="mypage-project-card__info">
                                                <h3 className="mypage-project-card__title">{project.projectName}</h3>
                                                <span
                                                    className={`mypage-project-card__status mypage-project-card__status--${project.status.toLowerCase()}`}
                                                >
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mypage__empty-state">
                                    <p>아직 참여중인 프로젝트가 없습니다.</p>
                                    <button onClick={() => navigate('/projects/create')} className="mypage__create-button">
                                        새 프로젝트 시작하기
                                    </button>
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyPage;