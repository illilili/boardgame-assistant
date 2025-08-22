// src/mypage/MyPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPageInfo } from '../api/auth.js';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
// ✨ 아이콘 추가
import { FaUserCircle, FaEdit, FaKey, FaEnvelope, FaBuilding, FaUserTag } from 'react-icons/fa';
import './MyPage.css';
import '../project/ProjectListPage.css';

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
        return (
            <div className="status-container">
                <div className="spinner"></div>
                <p>데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return <div className="status-container error-container">{error}</div>;
    }

    if (!userData) return null;

    return (
        <>
            <Header />
            <div className="mypage-background">
                <div className="mypage-layout">
                    <aside className="mypage-sidebar">
                        <div className="sidebar-profile-card">
                            <FaUserCircle className="profile-avatar" />
                            <h2 className="profile-name">{userData.userName}</h2>
                            
                            {/* --- ✨ 프로필 정보 섹션 재구성 --- */}
                            <div className="profile-info-group">
                                <div className="profile-info-item">
                                    <FaEnvelope className="info-icon" />
                                    <span>{userData.email}</span>
                                </div>
                                <div className="profile-info-item">
                                    <FaBuilding className="info-icon" />
                                    <span>{userData.company || '회사 정보 미입력'}</span>
                                </div>
                            </div>
                            <div className="profile-role-badge">
                                <FaUserTag className="role-icon" />
                                <span>{userData.role}</span>
                            </div>
                        </div>
                       
                    </aside>

                    <main className="mypage-main-content">
                        <section className="mypage-section">
                            <div className="mypage-section-header">
                                <h1 className="mypage-section-title">참여중인 프로젝트</h1>
                                <span className="project-count-badge">
                                    {userData.participatingProjects.length}개
                                </span>
                            </div>
                            
                            {userData.participatingProjects.length > 0 ? (
                                <div className="project-list-page__grid">
                                    {userData.participatingProjects.map(project => (
                                        <div
                                            key={project.projectId}
                                            className="project-list-page__card"
                                            onClick={() => navigate(`/projects/${project.projectId}`)}
                                        >
                                            <img
                                                src={project.thumbnailUrl || DEFAULT_THUMBNAIL}
                                                alt={`${project.projectName} 썸네일`}
                                                className="project-list-page__thumbnail"
                                            />
                                            <div className="project-list-page__card-info">
                                                <h3 className="project-list-page__card-title">{project.projectName}</h3>
                                                <span
                                                    className={`project-list-page__status-badge status--${project.status.toLowerCase()}`}
                                                >
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mypage-empty-state">
                                    <p>아직 참여중인 프로젝트가 없습니다.</p>
                                    <button onClick={() => navigate('/projects/create')} className="create-project-button">
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
