import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetail, getProjectMembers, getProjectRecentLogs, renameProject } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { ProjectContext } from '../contexts/ProjectContext';
import './ProjectHomePage.css';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/boardgame.4c780daaa5c5923b7a9b.png';

const maskName = (name) => {
  if (typeof name !== 'string' || name.length <= 1) {
    return name;
  }

  if (name.length === 2) {
    return name[0] + '*';
  }

  // 이름이 세 글자 이상이면 첫 글자와 마지막 글자만 빼고 마스킹
  const middle = '*'.repeat(name.length - 2);
  return name[0] + middle + name[name.length - 1];
};

const ProjectHomePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState({});
  const [status, setStatus] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [members, setMembers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const getProgressFromStatus = (status) => {
    switch (status) {
      case 'PLANNING': return 10;
      case 'REVIEW_PENDING': return 20;
      case 'DEVELOPMENT': return 50;
      case 'PUBLISHING': return 80;
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  useEffect(() => {
    if (!projectId) return;

    Promise.all([
      getProjectDetail(projectId),
      getProjectMembers(projectId),
      getProjectRecentLogs(projectId)
    ])
      .then(([detailData, membersData, logsData]) => {
        setProjectInfo(detailData);
        setStatus(detailData.status);
        setProgress(getProgressFromStatus(detailData.status));
        setProjectName(detailData.projectName);
        setProjectDesc(detailData.description);
        setMembers(membersData);
        setRecentLogs(logsData);
      })
      .catch(err => {
        console.error("프로젝트 정보 로딩 실패:", err);
        if (err.response?.status === 403) {
          alert("해당 프로젝트에 접근할 권한이 없습니다.");
          navigate('/projects');
        } else if (err.response?.status === 401) {
          alert("로그인이 필요합니다.");
          navigate('/login');
        } else {
          alert("프로젝트 정보를 불러오는 중 오류가 발생했습니다.");
        }
      });
  }, [projectId, navigate]);

  const handleEditSave = async () => {
    try {
      const updated = await renameProject(projectId, editTitle, editDesc);
      setProjectName(updated.updatedTitle);
      setProjectDesc(updated.updatedDescription);
      setShowEditModal(false);
      alert(updated.message);
    } catch (err) {
      console.error("프로젝트 수정 실패:", err);
      alert("프로젝트 정보를 수정할 수 없습니다.");
    }
  };


  if (!status) {
    return (
      <>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>
        <Footer />
      </>
    );
  }

  return (
    <ProjectContext.Provider value={{ projectId }}>
      <Header projectMode={true} />
      <div className="project-home-page__container">
        <aside className="project-home-page__sidebar">
          <ul className="project-home-page__nav-list">
            <li className="project-home-page__nav-item" onClick={() => navigate(`/projects/${projectId}/plan`)}>PLAN</li>
            <li className="project-home-page__nav-item" onClick={() => navigate(`/projects/${projectId}/development`)}>DEVELOP</li>
            <li className="project-home-page__nav-item" onClick={() => navigate(`/projects/${projectId}/publish`)}>PUBLISH</li>
          </ul>
        </aside>

        <main className="project-home-page__main-content">
          <div className="project-home-page__header">
            <div className="project-home-page__info">
              <h2>{projectName}</h2>
              <p className="project-home-page__description">
                {projectDesc || "프로젝트 설명이 없습니다."}
              </p>
              <div className="project-home-page__progress-container">
                <div className="project-home-page__progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="project-home-page__progress-percent">{progress}%</span>
              </div>
              <button
                className="project-home-page__edit-btn"
                onClick={() => {
                  setEditTitle(projectName);
                  setEditDesc(projectDesc || '');
                  setShowEditModal(true);
                }}
              >
                프로젝트 정보 수정하기
              </button>
            </div>
            <div className="project-home-page__thumbnail-wrapper">
              <img
                src={projectInfo.thumbnailUrl || DEFAULT_THUMBNAIL}
                alt={`${projectName} 썸네일`}
                className="project-home-page__thumbnail"
              />
            </div>
          </div>

          <div className="project-home-page__info-card">
            <h2>멤버 목록</h2>
            <ul className="project-home-page__member-list">
              {members.map((m, idx) => (
                <li key={idx} className="project-home-page__member-item">
                  <span className="project-home-page__member-role">{m.role}</span>
                  <span className="project-home-page__member-name">{maskName(m.userName)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="project-home-page__info-card">
            <h2>최근 작업</h2>
            <ul className="project-home-page__log-list">
              {recentLogs.map(log => (
                <li key={log.id} className="project-home-page__log-item">
                  <span className="project-home-page__log-action">{log.action}</span>
                  <span className="project-home-page__log-user">{maskName(log.username)}</span>
                  <span className="project-home-page__log-date">{new Date(log.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>

      {showEditModal && (
        <div className="project-home-page__modal-overlay">
          <div className="project-home-page__modal-content">
            <h3>프로젝트 정보 수정</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="새 프로젝트 이름"
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="프로젝트 설명 입력"
            />
            <div className="project-home-page__modal-actions">
              <button onClick={handleEditSave}>저장</button>
              <button onClick={() => setShowEditModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </ProjectContext.Provider>
  );
};

export default ProjectHomePage;