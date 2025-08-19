import React, { useEffect, useState } from 'react';
import { getAllProjects } from '../../api/apiClient';
import DeveloperAssignModal from './DeveloperAssignModal';
import { FiCheck } from 'react-icons/fi';   // ✅ 체크 아이콘 추가
import './DeveloperAssignList.css';

function DeveloperAssignList() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProjects();
        setProjects(data);
      } catch (err) {
        console.error('프로젝트 목록 불러오기 실패:', err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="assign-list__container">
      <h2 className="assign-list__title">프로젝트 목록</h2>

      <table className="project-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}></th> {/* 체크박스 칸 */}
            <th>ID</th>
            <th>프로젝트명</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const isSelected = selectedProject?.projectId === p.projectId;
            return (
              <tr
                key={p.projectId}
                onClick={() => setSelectedProject(p)}
                className={isSelected ? 'row-selected' : ''}
                style={{ cursor: 'pointer' }}
              >
                <td className="check-cell">
                  {isSelected && <FiCheck className="check-icon" />}
                </td>
                <td>#{p.projectId}</td>
                <td>{p.projectName}</td>
                <td>
                  <span className={`status-badge status-${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 하단 공통 버튼 */}
      <div className="assign-footer">
        <button
          className="assign-btn"
          disabled={!selectedProject}
          onClick={() => setShowModal(true)}
        >
          개발자 배정하기
        </button>
      </div>

      {showModal && selectedProject && (
        <DeveloperAssignModal
          project={selectedProject}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default DeveloperAssignList;
