import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './ProjectListPage.css';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllProjects() // ⬅ 여기만 전체 조회 API로 교체
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
            + 새 프로젝트 생성
          </button>
        </div>

        {error && <p className="project-list-page__error">{error}</p>}

        <div className="project-list-page__grid">
          {projects.length > 0 ? (
            projects.map((p) => (
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
                <h3 className="project-list-page__card-title">{p.projectName}</h3>
                <span className={`project-list-page__status-badge status--${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
              </div>
            ))
          ) : (
            !error && <p>아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProjectListPage;