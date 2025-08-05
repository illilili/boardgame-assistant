import React, { useState, useEffect } from 'react';
import './Goal.css'; // 전용 CSS 파일

const Goal = () => {
  const [conceptList, setConceptList] = useState([]);
  const [selectedConceptId, setSelectedConceptId] = useState('');
  const [objective, setObjective] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/plans/concepts');
        if (!response.ok) throw new Error('컨셉 목록 로딩 실패');
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
      setError('먼저 컨셉을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setObjective(null);

    try {
      const response = await fetch('http://localhost:8080/api/plans/generate-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId: parseInt(selectedConceptId) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '게임 목표 생성에 실패했습니다.');
      }

      const data = await response.json();
      setObjective(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goal-container">
      <div className="goal-form-section">
        <h2>게임 목표 설계</h2>
        <p>게임 목표를 설계할 보드게임 컨셉을 선택하고 버튼을 눌러주세요.</p>
        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="concept-select">컨셉 선택</label>
            <select
              id="concept-select"
              value={selectedConceptId}
              onChange={(e) => setSelectedConceptId(e.target.value)}
              required
            >
              <option value="" disabled>-- 기획안을 선택하세요 --</option>
              {conceptList.map(c => (
                <option key={c.conceptId} value={c.conceptId}>
                  ID: {c.conceptId} - {c.theme}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'AI 설계 중...' : '게임 목표 생성하기'}
          </button>
        </form>
      </div>

      <div className="goal-result-section">
        {loading && <div className="spinner"></div>}
        {error && <div className="error-message">{error}</div>}
        {objective && (
          <div className="objective-card">
            <h3>설계된 게임 목표</h3>
            <div className="objective-item">
              <h4>주요 목표 (Main Goal)</h4>
              <p>{objective.mainGoal}</p>
            </div>
            <div className="objective-item">
              <h4>보조 목표 (Sub Goals)</h4>
              <ul>
                {objective.subGoals.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
            <div className="objective-item">
              <h4>승리 조건 타입</h4>
              <p>{objective.winConditionType}</p>
            </div>
            <div className="objective-item">
              <h4>설계 노트</h4>
              <p>{objective.designNote}</p>
            </div>
          </div>
        )}
        {!loading && !objective && !error && (
          <div className="initial-state">
            <p>사용자께서는 먼저 원하는 게임 컨셉을 선택해 주시기 바랍니다.
              컨셉을 선택하신 후, '게임 목표 생성하기' 버튼을 눌러주세요.
              해당 버튼을 클릭하면 인공지능이 선택된 컨셉을 분석합니다.
              분석 결과를 바탕으로 적절하고 창의적인 게임 목표가 자동으로 설계됩니다.
              설계된 게임 목표는 아래의 결과 창에 실시간으로 출력됩니다.
              이를 통해 사용자는 게임 개발의 방향성을 손쉽게 확인하실 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goal;