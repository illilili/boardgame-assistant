import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { FaPlus } from 'react-icons/fa'; // 아이콘 추가
import './ProjectListPage.css';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

const ProjectListPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true); // ✨ 로딩 상태 추가
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getAllProjects();
                setProjects(data);
            } catch (err) {
                console.error('프로젝트 목록 불러오기 실패:', err);
                setError('프로젝트 목록을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false); // ✨ 데이터 로드 완료 후 로딩 상태 변경
            }
        };
        fetchProjects();
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
                    <h1 className="project-list-page__title">프로젝트 목록</h1>
                    <button
                        className="project-list-page__create-button"
                        onClick={handleCreateClick}
                    >
                        <FaPlus />
                        <span>새 프로젝트 생성</span>
                    </button>
                </div>

                {error && <p className="project-list-page__error">{error}</p>}

                {loading ? (
                    // ✨ 로딩 중일 때 스켈레톤 UI 표시
                    <div className="project-list-page__grid">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="project-list-page__card skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-text"></div>
                                <div className="skeleton-badge"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="project-list-page__grid">
                        {projects.length > 0 ? (
                            projects.map((p) => (
                                <div
                                    key={p.projectId}
                                    className="project-list-page__card"
                                    onClick={() => handleCardClick(p.projectId)}
                                >
                                    <div className="project-list-page__thumbnail-wrapper">
                                        <img
                                            src={p.thumbnailUrl || DEFAULT_THUMBNAIL}
                                            alt={`${p.projectName} 썸네일`}
                                            className="project-list-page__thumbnail"
                                        />
                                    </div>
                                    <div className="project-list-page__card-content">
                                        <h3 className="project-list-page__card-title">{p.projectName}</h3>
                                        <span className={`project-list-page__status-badge status--${p.status.toLowerCase()}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !error && <p className="project-list-page__empty-message">아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!</p>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default ProjectListPage;
