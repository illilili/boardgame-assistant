// src/publish/TranslationList.jsx
import React, { useEffect, useState, useContext } from 'react';
import { ProjectContext } from '../contexts/ProjectContext';
import { getTranslationCandidates } from '../api/publish';
import './TranslationList.css';

function TranslationList({ onSelectContent }) {
  const { projectId } = useContext(ProjectContext);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  if (!projectId) return;
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await getTranslationCandidates(projectId);
      setContents(data || []);
    } catch (err) {
      setError(err.message || '에러 발생');
    } finally {
      setLoading(false);
    }
  };
  fetchCandidates();
}, [projectId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (contents.length === 0) return <div>번역할 콘텐츠가 없습니다.</div>;

  return (
    <div className="translation-list">
      <h2>번역 대기 목록</h2>
      <div className="translation-list-header">
        <span style={{ width: '20%' }}>ID</span>
        <span style={{ width: '60%' }}>이름</span>
        <span style={{ width: '20%' }}>타입</span>
      </div>
      <ul>
        {contents.map(content => {
          const type = content.componentType?.toLowerCase();
          const typeClass =
            type === 'card' ? 'type-card'
              : type === 'rulebook' ? 'type-rulebook'
                : 'type-default';

          return (
            <li
              key={content.contentId}
              className="translation-list-item"
              onClick={() => onSelectContent(content.contentId)}
            >
              <span className="id-col" style={{ width: '20%' }}>
                {content.contentId}
              </span>
              <span style={{ width: '60%' }}>{content.name || '(이름 없음)'}</span>
              <span style={{ width: '20%' }}>
                <span className={`type-badge ${typeClass}`}>
                  {content.componentType}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TranslationList;
