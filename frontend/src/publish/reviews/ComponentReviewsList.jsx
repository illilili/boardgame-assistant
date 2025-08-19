import React, { useEffect, useState, useCallback } from 'react';
import { getPendingComponentsGrouped } from '../../api/apiClient';
import ComponentReviewDetail from './ComponentReviewDetail';
import './ComponentReviewList.css';

// 제출자 마스킹 (가운데 한 글자만 *)
const maskSubmitter = (name) => {
  if (!name) return "-";
  if (name.length === 2) return name[0] + "*";
  const mid = Math.floor(name.length / 2);
  return name.substring(0, mid) + "*" + name.substring(mid + 1);
};

// 타입 분류 → CSS class
const getTypeClass = (type) => {
  if (!type) return "comp-type etc";
  const lower = type.toLowerCase();

  if (lower.includes("card")) return "comp-type card";
  if (lower.includes("rulebook") || lower.includes("document")) return "comp-type rulebook";
  if (["token", "pawn", "miniature", "figure", "dice"].some(k => lower.includes(k)))
    return "comp-type model";
  if (lower.includes("thumbnail") || lower.includes("image")) return "comp-type thumbnail";

  return "comp-type etc";
};

// 타입 이름 그대로 출력
const getTypeLabel = (type) => {
  if (!type) return "Etc";
  const lower = type.toLowerCase();

  if (lower.includes("card")) return "Card";
  if (lower.includes("rulebook") || lower.includes("document")) return "Rulebook";
  if (["token", "pawn", "miniature", "figure", "dice"].some(k => lower.includes(k)))
    return "Model";
  if (lower.includes("thumbnail") || lower.includes("image")) return "Thumbnail";

  return "Etc";
};

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

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  if (selectedComponentId) {
    return (
      <ComponentReviewDetail
        componentId={selectedComponentId}
        onBack={() => {
          setSelectedComponentId(null);
          fetchList();
        }}
      />
    );
  }

  return (
    <div className="review-container">
      <h1 className="review-title">제출된 컴포넌트 목록 (승인 대기)</h1>
      {groups.length === 0 ? (
        <p>승인 대기 중인 컴포넌트가 없습니다.</p>
      ) : (
        groups.map((group) => (
          <div key={group.projectId} className="project-card">
            <h2>{group.projectTitle} <span>(ID: {group.projectId})</span></h2>
            <div className="component-list">
              {group.items.map((comp) => (
                <div
                  key={comp.componentId}
                  className="component-card"
                  onClick={() => setSelectedComponentId(comp.componentId)}
                >
                  <div className="comp-title">{comp.componentTitle}</div>
                  <div className={getTypeClass(comp.componentType)}>
                    {getTypeLabel(comp.componentType)}
                  </div>
                  <div className="comp-meta">
                    <span className="submitted-by">
                      제출자: {maskSubmitter(comp.submittedBy)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ComponentReviewList;
