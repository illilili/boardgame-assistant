import React, { useEffect, useState } from 'react';
import { getAllProjects } from '../api/project'; 
import { useNavigate } from 'react-router-dom';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './ProjectListPage.css';

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllProjects()
      .then(data => setProjects(data))
      .catch(err => console.error('프로젝트 목록 불러오기 실패:', err));
  }, []);

  const handleClick = (id) => {
    navigate(`/projects/${id}`);
  };

  return (
    <>
      <Header />
      <main className="project-list-container">
        <div className="project-list-header">
          <h2 className="page-title">프로젝트 목록</h2>
          <button
            className="primary-button"
            onClick={() => navigate('/project/create')}
          >
            + 새 프로젝트 생성
          </button>
        </div>

        <div className="project-list-grid">
          {projects.map((p) => (
            <div
              key={p.projectId}
              className="project-card"
              onClick={() => handleClick(p.projectId)}
            >
              <h3>{p.projectName}</h3>
              <p>프로젝트 ID: {p.projectId}</p>
              <span className="project-status-badge">{p.status}</span>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProjectListPage;
