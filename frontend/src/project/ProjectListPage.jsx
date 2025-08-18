import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './ProjectListPage.css';
// ✨ 아이콘 추가 (버튼 디자인 강화)
import { FaPlus } from 'react-icons/fa';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

// ✨ 프로젝트 상태에 따른 진행률을 계산하는 함수 추가
const getProgressFromStatus = (status) => {
    switch (status) {
        case 'PLANNING': return 15;
        case 'REVIEW_PENDING': return 30;
        case 'DEVELOPMENT': return 60;
        case 'PUBLISHING': return 85;
        case 'COMPLETED': return 100;
        default: return 0;
    }
};

const ProjectListPage = () => {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        getAllProjects()
            .then(data => setProjects(data))
            .catch(err => {
                console.error('프로젝트 목록 불러오기 실패:', err);
                setError('프로젝트 목록을 불러오는 데 실패했습니다.');
            });
    }, []);

    const handleCardClick = (id) => {
        navigate(`/projects/${id}`);
    };

    const handleCreateClick = () => {
        navigate('/project/create');
    };

    return (
        <>
            <Header />
            <main className="project-list-page__container">
                <div className="project-list-page__header">
                    <h2 className="project-list-page__title">프로젝트 목록</h2>
                    <button
                        className="project-list-page__create-button"
                        onClick={handleCreateClick}
                    >
                        {/* ✨ 아이콘 추가 */}
                        <FaPlus /> 새 프로젝트 생성
                    </button>
                </div>

                {error && <p className="project-list-page__error">{error}</p>}

                <div className="project-list-page__grid">
                    {projects.length > 0 ? (
                        projects.map((p) => {
                            // ✨ 각 프로젝트의 진행률 계산
                            const progress = getProgressFromStatus(p.status);
                            return (
                                <div
                                    key={p.projectId}
                                    className="project-list-page__card"
                                    onClick={() => handleCardClick(p.projectId)}
                                >
                                    <img
                                        src={p.thumbnailUrl || DEFAULT_THUMBNAIL}
                                        alt={`${p.projectName} 썸네일`}
                                        className="project-list-page__thumbnail"
                                    />
                                    {/* ✨ 카드 콘텐츠를 감싸는 div 추가 */}
                                    <div className="project-list-page__card-content">
                                        <h3 className="project-list-page__card-title">{p.projectName}</h3>
                                        <span className={`project-list-page__status-badge status--${p.status.toLowerCase().replace('_', '-')}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                        {/* ✨ 진행률 바 UI 추가 */}
                                        <div className="project-list-page__progress-bar-container">
                                            <div 
                                                className="project-list-page__progress-bar-fill" 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        !error && <p className="project-list-page__empty-message">아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!</p>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ProjectListPage;