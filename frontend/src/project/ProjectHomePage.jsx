import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetail, getProjectMembers, getProjectRecentLogs, renameProject } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { ProjectContext } from '../contexts/ProjectContext';
import './ProjectHomePage.css';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

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

  // 수정 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

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
        navigate('/projects');
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
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>
        <Footer />
      </>
    );
  }

  return (
    <ProjectContext.Provider value={{ projectId }}>
      <Header projectMode={true} />
      <div className="workspace-container new-design">

        {/* ===== 사이드바 ===== */}
        <aside className="workspace-sidebar">
          <ul className="workspace-nav-list">
            <li className="nav-item" onClick={() => navigate(`/projects/${projectId}/plan`)}>PLAN</li>
            <li className="nav-item" onClick={() => navigate(`/projects/${projectId}/development`)}>DEVELOP</li>
            <li className="nav-item" onClick={() => navigate(`/projects/${projectId}/publish`)}>PUBLISH</li>
          </ul>
        </aside>

        {/* ===== 메인 컨텐츠 ===== */}
        <main className="workspace-main-content">
          <div className="project-home-header">
            <div className="project-info">
              <h2>{projectName}</h2>
              <p className="project-description">
                {projectDesc ? projectDesc : "프로젝트 설명이 없습니다."}
              </p>
              <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>

              {/* 진행률 */}
              <div className="progress-container" style={{ marginTop: '10px' }}>
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span>{progress}%</span>
              </div>

              {/* 수정 버튼 */}
              <button
                className="edit-project-btn"
                onClick={() => {
                  setEditTitle(projectName);
                  setEditDesc(projectDesc || '');
                  setShowEditModal(true);
                }}
              >
                프로젝트 정보 수정하기
              </button>
            </div>
            <div className="project-thumbnail-wrapper">
              <img
                src={projectInfo.thumbnailUrl || DEFAULT_THUMBNAIL}
                alt={`${projectInfo.projectName} 썸네일`}
                className="project-home-thumbnail"
              />
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="info-card">
            <h2>멤버 목록</h2>
            <ul className="member-list">
              {members.map((m, idx) => (
                <li key={idx} className="member-item">
                  <span className="member-role">{m.role}</span>
                  <span className="member-name">{m.userName}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 최근 작업 */}
          <div className="info-card">
            <h2>최근 작업</h2>
            <ul className="log-list">
              {recentLogs.map(log => (
                <li key={log.id} className="log-item">
                  <span className="log-action">{log.action}</span>
                  <span className="log-user">{log.username}</span>
                  <span className="log-date">{new Date(log.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>

      {/* ===== 수정 모달 ===== */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
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
            <div className="modal-actions">
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
