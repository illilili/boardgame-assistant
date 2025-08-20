// src/admin/ProjectManagePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { fetchAllProjects, deleteProject } from '../api/admin';
import './ProjectManagePage.css';

const AdminProjectManagePage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetchAllProjects();
      setProjects(res.data);
    } catch (err) {
      console.error('프로젝트 불러오기 실패:', err);
      alert('프로젝트 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (projectId) => {
    if (!window.confirm("정말 이 프로젝트를 삭제하시겠습니까?")) return;
    try {
      await deleteProject(projectId);
      alert("프로젝트가 삭제되었습니다.");
      loadProjects();
    } catch (err) {
      console.error("프로젝트 삭제 실패:", err);
      alert("프로젝트 삭제에 실패했습니다.");
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;

  return (
    <main className="admin-page__container">
      <h2 className="admin-page__title">프로젝트 관리</h2>
      <table className="admin-page__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>프로젝트명</th>
            <th>생성일</th>
            <th>상태</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.projectId}>
              <td>{p.projectId}</td>
              <td>{p.projectName}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td>{p.status || '진행중'}</td>
              <td>
                <button
                  onClick={() => handleDelete(p.projectId)}
                  className="admin-btn admin-btn--delete"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default AdminProjectManagePage;
