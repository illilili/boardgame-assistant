import React, { useEffect, useState, useCallback } from 'react';
import { getPendingComponentsGrouped } from '../../api/apiClient';
import ComponentReviewDetail from './ComponentReviewDetail';

function ComponentReviewList() {
  const [groups, setGroups] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPendingComponentsGrouped();
      setGroups(data);
    } catch (err) {
      setError(err.response?.data?.message || '목록 불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>;

  if (selectedComponentId) {
    return (
      <ComponentReviewDetail
        componentId={selectedComponentId}
        onBack={() => {
          setSelectedComponentId(null); // 상세 → 목록
          fetchList();                  // 승인/반려 후 최신 목록 재조회
        }}
      />
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>제출된 컴포넌트 목록 (승인 대기)</h1>
      {groups.length === 0 ? (
        <p>승인 대기 중인 컴포넌트가 없습니다.</p>
      ) : (
        groups.map((group) => (
          <div key={group.projectId} style={{ marginBottom: '2rem' }}>
            <h2>{group.projectTitle} (프로젝트 ID: {group.projectId})</h2>
            <ul>
              {group.items.map((comp) => (
                <li key={comp.componentId} style={{ margin: '0.5rem 0' }}>
                  <button
                    onClick={() => setSelectedComponentId(comp.componentId)}
                    style={{
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      background: '#f9f9f9',
                      cursor: 'pointer',
                    }}
                  >
                    {comp.componentTitle} ({comp.componentType}) - 제출자: {comp.submittedBy}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default ComponentReviewList;
