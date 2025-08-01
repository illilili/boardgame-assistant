import React, { useState, useEffect } from 'react';
import './Components.css'; 

const Components = () => {
  const [conceptList, setConceptList] = useState([]);
  const [selectedConceptId, setSelectedConceptId] = useState('');
  const [componentsData, setComponentsData] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/plans/concepts');
        if (!response.ok) throw new Error('컨셉 목록을 불러오는 데 실패했습니다.');
        const data = await response.json();
        setConceptList(data.sort((a, b) => b.conceptId - a.conceptId));
      } catch (err) {
        setError(err.message);
      }
    };
    fetchConcepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConceptId) {
      setError('먼저 기획안을 선택해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setComponentsData(null);

    try {
      const response = await fetch('http://localhost:8080/api/plans/generate-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId: parseInt(selectedConceptId) }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '구성요소 생성에 실패했습니다.');
      }
      const data = await response.json();
      setComponentsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="components-container">
      <div className="components-form-section">
        <h2>게임 구성요소 설계</h2>
        <p>구성요소를 설계할 기획안을 선택하고 AI에게 생성을 요청하세요.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="concept-select">기획안 선택 (Concept ID 기준)</label>
            <select
              id="concept-select"
              value={selectedConceptId}
              onChange={(e) => setSelectedConceptId(e.target.value)}
              required
            >
              <option value="" disabled>-- 기획안(Concept) 선택 --</option>
              {conceptList.map(c => (
                <option key={c.conceptId} value={c.conceptId}>
                  ID: {c.conceptId} - {c.theme}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'AI 설계 중...' : '구성요소 생성하기'}
          </button>
        </form>
      </div>

      <div className="components-result-section">
        {isLoading && <div className="spinner"></div>}
        {error && <div className="error-message">{error}</div>}
        {componentsData && (
          <div className="components-card">
            <h3>AI가 설계한 게임 구성요소</h3>
            <div className="components-list">
              {Array.isArray(componentsData.component) && componentsData.component.map((item) => (
                <div key={item.componentId} className="component-item">
                  <div className="item-header">
                    <span className="item-type-tag">{item.type}</span>
                    <strong className="item-name">{item.title}</strong>
                    {item.quantity && <span className="item-quantity">({item.quantity})</span>}
                  </div>
                  {/* [수정] 상세 정보 필드 표시 */}
                  <p className="item-detail"><strong>역할 및 효과:</strong> {item.roleAndEffect}</p>
                  <p className="item-detail"><strong>아트 컨셉:</strong> {item.artConcept}</p>
                  <p className="item-detail"><strong>상호작용:</strong> {item.interconnection}</p>
                  
                  <div className="subtask-section">
                    <strong>세부 제작 작업:</strong>
                    <ul className="subtask-list">
                      {Array.isArray(item.subTasks) && item.subTasks.map(task => (
                        <li key={task.contentId} className={`status-${task.status.toLowerCase()}`}>
                          {task.type} ({task.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && !componentsData && !error && (
            <div className="initial-state">
              <p>기획안을 선택하고 '구성요소 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Components;
