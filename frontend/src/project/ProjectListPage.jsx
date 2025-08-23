import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { FaPlus, FaArrowRight } from 'react-icons/fa';
import './ProjectListPage.css';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/boardgame.4c780daaa5c5923b7a9b.png';

const ProjectListPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    // --- ✨ 캐러셀을 위한 상태 추가 ---
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getAllProjects();
                setProjects(data);
            } catch (err) {
                console.error('프로젝트 목록 불러오기 실패:', err);
                setError('프로젝트 목록을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
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
    
    // --- ✨ 필터링 로직 & 캐러셀 인덱스 초기화 ---
    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setActiveIndex(0); // 필터 변경 시 캐러셀 인덱스를 처음으로 초기화
    };

    const filteredProjects = projects.filter(p =>
        filterStatus === 'all' || p.status.toLowerCase() === filterStatus
    );

    // --- ✨ 캐러셀 렌더링 부분 ---
    const renderCompletedCarousel = () => (
        <div className="project-list-page__carousel-container">
            <div className="project-list-page__carousel-list">
                {filteredProjects.map((p, index) => {
                    const offset = index - activeIndex;
                    let cardClass = 'project-carousel-card';
                    if (offset === 0) cardClass += ' active';
                    else if (offset === -1) cardClass += ' prev';
                    else if (offset === 1) cardClass += ' next';
                    else if (offset < -1) cardClass += ' far-prev';
                    else if (offset > 1) cardClass += ' far-next';

                    return (
                        <div
                            key={p.projectId}
                            className={cardClass}
                            style={{ backgroundImage: `url(${p.thumbnailUrl || DEFAULT_THUMBNAIL})` }}
                            onClick={() => setActiveIndex(index)}
                        >
                            <div className="project-carousel-card__content">
                                <h3>{p.projectName}</h3>
                                {offset === 0 && (
                                    <button 
                                        className="project-carousel-card__button"
                                        onClick={() => handleCardClick(p.projectId)}
                                    >
                                        프로젝트 보기 <FaArrowRight />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    // --- ✨ 일반 그리드 렌더링 부분 ---
    const renderProjectGrid = () => (
         <div className="project-list-page__grid">
            {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
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
                !error && <p className="project-list-page__empty-message">해당 상태의 프로젝트가 없습니다.</p>
            )}
        </div>
    );

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

                <div className="project-list-page__filter-bar">
                     <button className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>모두 보기</button>
                     <button className={`filter-button ${filterStatus === 'planning' ? 'active' : ''}`} onClick={() => handleFilterChange('planning')}>기획중</button>
                     <button className={`filter-button ${filterStatus === 'development' ? 'active' : ''}`} onClick={() => handleFilterChange('development')}>개발중</button>
                     <button className={`filter-button ${filterStatus === 'completed' ? 'active' : ''}`} onClick={() => handleFilterChange('completed')}>완료됨</button>
                </div>

                {loading ? (
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
                    filterStatus === 'completed' ? renderCompletedCarousel() : renderProjectGrid()
                )}
            </main>
            <Footer />
        </>
    );
};

export default ProjectListPage;