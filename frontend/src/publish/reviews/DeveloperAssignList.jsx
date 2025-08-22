import React, { useEffect, useState } from 'react';
import { getAllProjects } from '../../api/apiClient';
import DeveloperAssignModal from './DeveloperAssignModal';
import './DeveloperAssignList.css';

// 필터링할 상태 정의
const STATUS_FILTERS = ['ALL', 'PLANNING', 'DEVELOPMENT', 'PUBLISHING', 'COMPLETED', 'REVIEW_PENDING'];
const STATUS_KO = {
  ALL: '전체',
  PLANNING: '기획',
  DEVELOPMENT: '개발',
  PUBLISHING: '출시',
  COMPLETED: '완료',
  REVIEW_PENDING: '검토 대기',
};


function DeveloperAssignList() {
  const [allProjects, setAllProjects] = useState([]); // API에서 받아온 모든 프로젝트 원본
  const [filteredProjects, setFilteredProjects] = useState([]); // 필터링된 프로젝트
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 현재 활성화된 필터

  // 프로젝트 데이터 로딩
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProjects();
        setAllProjects(data);
      } catch (err) {
        console.error('프로젝트 목록 불러오기 실패:', err);
      }
    };
    fetchProjects();
  }, []);
  
  // 필터가 변경될 때마다 프로젝트 목록을 필터링
  useEffect(() => {
    if (activeFilter === 'ALL') {
      setFilteredProjects(allProjects);
    } else {
      setFilteredProjects(allProjects.filter(p => p.status === activeFilter));
    }
    setSelectedProject(null); // 필터 변경 시 선택 초기화
  }, [activeFilter, allProjects]);

  const handleRefresh = () => {
    setSelectedProject(null);
    getAllProjects().then(data => {
      setAllProjects(data)
    }).catch(console.error);
  };

  return (
    <div className="dev-assign-page">
      <header className="dev-assign-header">
        <h1 className="dev-assign-header__title">개발자 배정</h1>
        <p className="dev-assign-header__subtitle">
          프로젝트를 선택하고 담당 개발자를 배정해주세요.
        </p>
      </header>

      {/* ✨ 상태 필터 탭 UI */}
      <div className="dev-assign-filters">
        {STATUS_FILTERS.map(filter => (
          <button
            key={filter}
            className={`dev-assign-filters__button ${activeFilter === filter ? 'dev-assign-filters__button--active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {STATUS_KO[filter] || filter}
          </button>
        ))}
      </div>

      {/* ✨ 데이터 테이블 UI */}
      <main className="dev-assign-main-content">
        <div className="dev-assign-table-wrapper">
          <table className="dev-assign-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>프로젝트명</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const isSelected = selectedProject?.projectId === p.projectId;
                return (
                  <tr
                    key={p.projectId}
                    className={isSelected ? 'dev-assign-table__row--selected' : ''}
                    onClick={() => setSelectedProject(p)}
                  >
                    <td>
                      <span className="dev-assign-table__id">#{p.projectId}</span>
                    </td>
                    <td>{p.projectName}</td>
                    <td>
                       <span className={`dev-assign-status-badge dev-assign-status-badge--${p.status.toLowerCase()}`}>
                        {STATUS_KO[p.status] || p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="dev-assign-footer">
        <button
          className="dev-assign-action-button"
          disabled={!selectedProject}
          onClick={() => setShowModal(true)}
        >
          {selectedProject ? `'${selectedProject.projectName}' 개발자 배정하기` : '프로젝트를 선택하세요'}
        </button>
      </footer>

      {showModal && selectedProject && (
        <DeveloperAssignModal
          project={selectedProject}
          onClose={() => setShowModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}

export default DeveloperAssignList;