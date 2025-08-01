import React, { useState, useEffect } from 'react';
import './Components.css'; 

const Components = () => {
  const [conceptList, setConceptList] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [componentsData, setComponentsData] = useState(null);
  
  // [수정] 초기 로딩 상태와 API 호출 로딩 상태를 분리
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        setError(null); // 에러 초기화
        const response = await fetch('http://localhost:8080/api/plans/concepts');
        if (!response.ok) {
          throw new Error('컨셉 목록을 불러오는 데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        }
        const data = await response.json();
        // [수정] 데이터가 배열이 아닐 경우를 대비한 방어 코드
        if (Array.isArray(data)) {
            setConceptList(data.sort((a, b) => b.conceptId - a.conceptId));
        } else {
            setConceptList([]);
            throw new Error('잘못된 형식의 컨셉 목록 데이터입니다.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setInitialLoading(false); // 초기 로딩 완료
      }
    };
    fetchConcepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError('먼저 기획안을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setComponentsData(null);

    try {
      const response = await fetch('http://localhost:8080/api/plans/generate-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: parseInt(selectedPlanId) }),
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
      setIsSubmitting(false);
    }
  };

  // [추가] 초기 로딩 중일 때 표시할 화면
  if (initialLoading) {
    return <div className="loading-state">구성요소 페이지를 불러오는 중...</div>;
  }

  return (
    <div className="components-container">
      <div className="components-form-section">
        <h2>게임 구성요소 설계</h2>
        <p>구성요소를 설계할 기획안을 선택하고 AI에게 생성을 요청하세요.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="plan-select">기획안 선택</label>
            <select
              id="plan-select"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
            >
              <option value="" disabled>-- 기획안(Plan) 선택 --</option>
              {conceptList.map(c => (
                <option key={c.planId} value={c.planId}>
                  Plan ID: {c.planId} - {c.theme}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'AI 설계 중...' : '구성요소 생성하기'}
          </button>
        </form>
      </div>

      <div className="components-result-section">
        {isSubmitting && <div className="spinner"></div>}
        {error && <div className="error-message">{error}</div>}
        {componentsData && (
          <div className="components-card">
            <h3>설계된 게임 구성요소</h3>
            <div className="components-list">
              {/* [수정] componentsData.component가 배열인지 확인하는 방어 코드 추가 */}
              {Array.isArray(componentsData.component) && componentsData.component.map((item) => (
                <div key={item.componentId} className="component-item">
                  <div className="item-header">
                    <span className="item-type-tag">{item.type}</span>
                    <strong className="item-name">{item.title}</strong>
                  </div>
                  <p className="item-description"><strong>설명:</strong> {item.description}</p>
                  <p className="item-effect"><strong>효과:</strong> {item.effect}</p>
                  <div className="subtask-section">
                    <strong>세부 제작 작업:</strong>
                    <ul className="subtask-list">
                      {/* [수정] item.subTasks가 배열인지 확인하는 방어 코드 추가 */}
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
         {!isSubmitting && !componentsData && !error && (
            <div className="initial-state">
                <p>기획안을 선택하고 '구성요소 생성하기' 버튼을 누르면 AI가 설계한 결과가 여기에 표시됩니다.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Components;