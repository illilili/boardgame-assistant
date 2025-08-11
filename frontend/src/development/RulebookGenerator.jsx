// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './RulebookGenerator.css';

// 초기 폼 데이터 (요청에 제공된 예시)
const initialFormData = {
  projectId: 1,
  planId: 1,
  rulebookTitle: "미스터리 탐정 보드게임",
  theme: "추리/미스터리",
  storyline: "1920년대 런던을 배경으로 한 살인 사건을 해결하는 탐정들의 이야기. 플레이어들은 각각 다른 탐정이 되어 단서를 수집하고 범인을 찾아야 합니다.",
  goal: {
    mainGoal: "범인을 가장 먼저 찾아내는 것",
    subGoals: ["단서 카드 수집하기", "증인 심문하기", "알리바이 확인하기", "범죄 현장 조사하기"],
  },
  rule: {
    turnStructure: "시계방향으로 턴을 진행하며, 각 턴마다 2개의 행동을 할 수 있습니다.",
    actionRules: ["이동: 인접한 방으로 이동할 수 있습니다", "조사: 현재 위치에서 단서 카드를 뽑을 수 있습니다", "추론: 다른 플레이어에게 질문을 할 수 있습니다", "고발: 범인이라고 생각하는 플레이어를 지목할 수 있습니다"],
    victoryCondition: "정확한 범인, 무기, 장소를 모두 맞춘 플레이어가 승리합니다",
    penaltyRules: ["잘못된 고발 시 한 턴 쉬기", "같은 방에 3턴 연속 머물 시 단서 카드 1장 반납", "거짓 증언 적발 시 패널티 카드 받기"],
  },
  components: [
    { type: "카드", name: "단서 카드", effect: "사건 해결에 필요한 정보를 제공합니다", visualType: "일러스트가 포함된 카드" },
    { type: "보드", name: "저택 지도", effect: "플레이어들이 이동할 수 있는 공간을 나타냅니다", visualType: "2D 평면도" },
  ],
  targetAudience: "12세 이상 추리 게임을 좋아하는 사람들",
  playerCount: "3-6명",
  playTime: "60-90분",
  difficulty: "중급",
  additionalNotes: "첫 게임 시에는 간단한 시나리오로 시작하는 것을 권장합니다.",
};

// 생성된 룰북 데이터를 표시하는 컴포넌트
const ResultDisplay = ({ result }) => {
  if (!result) return null;

  if (result.status === 'ERROR') {
    return <div className="error-message">{result.message}</div>;
  }

  const { rule_data, pdfUrl, timestamp } = result;

  return (
    <div className="result-container">
      <h2>🎉 룰북 생성 완료!</h2>
      <div className="result-section">
        <strong>PDF 다운로드 링크:</strong> <a href={pdfUrl} target="_blank" rel="noopener noreferrer">{pdfUrl}</a>
      </div>
      <div className="result-section">
        <strong>생성 시각:</strong> <p>{new Date(timestamp).toLocaleString()}</p>
      </div>

      {/* rule_data 객체의 각 항목을 동적으로 렌더링 */}
      {Object.entries(rule_data).map(([key, value]) => (
        <div key={key} className="result-section">
          <strong>{key.replace(/_/g, ' ').replace('rule ', '')}</strong>
          {/* 값에 줄바꿈 문자가 포함된 경우를 위해 pre-wrap 스타일 적용 */}
          <p style={{ whiteSpace: 'pre-wrap' }}>{value}</p>
        </div>
      ))}
    </div>
  );
};


function RulebookGenerator() {
  // 입력 폼 데이터, API 응답 결과, 로딩 및 에러 상태를 관리합니다.
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Spring Boot 서버(http://localhost:8080)에 POST 요청을 보냅니다.
      const response = await axios.post('http://localhost:8080/api/content/generate-rulebook', formData);
      setResult(response.data);
    } catch (err) {
      setError('룰북 생성에 실패했습니다. 서버 로그를 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // 간단한 입력 핸들러 (실제 프로젝트에서는 더 정교하게 만들어야 합니다)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <header>
        <h1>🎲 보드게임 룰북 생성기</h1>
        <p>AI를 이용하여 보드게임 기획안으로 멋진 룰북 초안을 만들어보세요.</p>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="form-container">
          {/* 편의상 일부 필드만 표시하고, 실제로는 모든 필드를 입력받도록 확장할 수 있습니다. */}
          <div className="form-group">
            <label htmlFor="rulebookTitle">게임 제목</label>
            <input id="rulebookTitle" type="text" name="rulebookTitle" value={formData.rulebookTitle} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="storyline">스토리라인</label>
            <textarea id="storyline" name="storyline" value={formData.storyline} onChange={handleInputChange} rows="4"></textarea>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? '생성 중...' : '룰북 생성하기'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        
        {/* 로딩 인디케이터 */}
        {loading && <div className="loading-spinner"></div>}

        {/* 결과 표시 컴포넌트 */}
        <ResultDisplay result={result} />
      </main>
    </div>
  );
}

export default RulebookGenerator;