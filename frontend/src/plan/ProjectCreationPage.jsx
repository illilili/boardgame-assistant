import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/project';
import { FaPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import './ProjectCreationPage.css';
import Header from '../mainPage/Header';

const ProjectCreationPage = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!projectName.trim()) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await createProject({
        name: projectName,
        description: description,
      });
      setSuccessData({ message: data.message, projectId: data.projectId });
    } catch (err) {
      console.error("프로젝트 생성 실패:", err);
      if (err.response?.status === 403) {
        setError(err.response?.data?.message || "프로젝트 생성 권한이 없습니다. (기획자만 생성 가능)");
      } else if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
      } else {
        setError(err.message || "프로젝트 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false); 
    }
  };

  const renderSuccessCard = () => (
    <div className="creation-card success-card">
      <FaCheckCircle className="success-icon" />
      <h2 className="creation-title">프로젝트 생성 완료!</h2>
      <p className="creation-subtitle">{successData.message}</p>
      <button
        onClick={() => navigate(`/projects/${successData.projectId}`)}
        className="submit-button"
      >
        워크스페이스로 이동하기
      </button>
    </div>
  );

  const renderFormCard = () => (
    <div className="creation-card">
      <h1 className="creation-title">새로운 보드게임 프로젝트</h1>
      <p className="creation-subtitle">세상을 놀라게 할 당신의 아이디어를 현실로 만들어보세요.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="form-input"
            disabled={isLoading}
            required
          />
          <label htmlFor="projectName" className="form-label">프로젝트 제목</label>
        </div>
        <div className="form-group">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="form-input"
            disabled={isLoading}
          />
          <label htmlFor="description" className="form-label">프로젝트 설명 (선택 사항)</label>
        </div>

        {error && (
          <div className="error-box">
            <FaExclamationTriangle />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <FaPlus />
              <span>프로젝트 생성</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  return (
    // ✨ 전체를 감싸는 Fragment 추가
    <>
      {/* ✨ Header를 최상단으로 이동 */}
      <Header />
      <div className="creation-background">
        <div className="creation-container">
          <div className="inspiration-panel">
            <div className="inspiration-content">
              <div className="logo">BOARD.CO</div>
            </div>
          </div>
          <div className="form-panel">
            {successData ? renderSuccessCard() : renderFormCard()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectCreationPage;