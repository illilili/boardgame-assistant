import React, { useMemo } from 'react';
import './CopyrightModal.css';

// 데이터 분석 함수 (변경 없음)
const parseAnalysisSummary = (summaryText) => {
  if (!summaryText) return [];
  // ... (기존과 동일)
  const lines = summaryText.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed !== '' && trimmed !== '**';
  });
  const results = [];
  let currentSection = null;
  lines.forEach(line => {
    const trimmedLine = line.trim();
    const titleMatch = trimmedLine.match(/^\*\*(.*?)(?::|\*\*|$)/);
    const listItemMatch = trimmedLine.match(/^\s*[-•]\s*(.*)/);
    if (titleMatch && !listItemMatch) {
      const title = titleMatch[1].trim();
      if (currentSection) results.push(currentSection);
      currentSection = { title, content: [], items: [] };
    } else if (listItemMatch) {
      if (!currentSection) currentSection = { title: null, items: [] };
      currentSection.items.push(listItemMatch[1].trim());
    } else {
      const content = trimmedLine.replace(/^\*\*|\*\*$/g, '').trim();
      if (!currentSection) currentSection = { title: null, content: [], items: [] };
      currentSection.content.push(content);
    }
  });
  if (currentSection) results.push(currentSection);
  return results.map(section => {
    let type = 'card';
    if (section.items && section.items.length > 0) {
      if (section.title && (section.title.includes('권장') || section.title.includes('개선'))) {
        type = 'recommendation';
      } else {
        type = 'list';
      }
    } else if (!section.title && section.content) {
      type = 'paragraph';
    }
    return { ...section, type, content: section.content ? section.content.join(' ') : null };
  });
};

// 로딩 스켈레톤 컴포넌트 (변경 없음)
const LoadingSkeleton = () => (
  // ... (기존과 동일)
    <>
    <div className="cr-modal-sidebar">
      <div className="cr-modal-sidebar-header">
        <h2 className="cr-modal-sidebar-title">분석 결과</h2>
      </div>
      <div className="cr-modal-sidebar-content">
        <div className="skeleton-item" style={{ height: '230px', marginBottom: '32px' }}></div>
        <div className="skeleton-item" style={{ height: '180px' }}></div>
      </div>
    </div>
    <div className="cr-modal-main">
      <h2 className="cr-modal-main-title">유사 게임 목록</h2>
      <div className="skeleton-item" style={{ height: '120px', marginBottom: '16px' }}></div>
      <div className="skeleton-item" style={{ height: '120px', marginBottom: '16px' }}></div>
      <div className="skeleton-item" style={{ height: '120px' }}></div>
    </div>
  </>
);

// ✨ [개선] 위험도 게이지 컴포넌트
const RiskGauge = ({ riskLevel }) => {
  // ✨ [개선] 다양한 위험도 문자열을 처리하는 함수
  const getRiskDetails = (level) => {
    const upperLevel = level?.toUpperCase() || '';
    if (upperLevel.includes('DANGER') || upperLevel.includes('HIGH')) {
      return {
        className: "risk--danger", text: "위험", icon: "🚨",
        description: "표절 위험이 높아 법적 조치가 필요할 수 있습니다.",
        rotation: 60
      };
    }
    if (upperLevel.includes('CAUTION') || upperLevel.includes('MEDIUM')) {
      return {
        className: "risk--caution", text: "주의", icon: "⚠️",
        description: "일부 요소가 유사하여 수정 및 검토가 필요합니다.",
        rotation: 0
      };
    }
    // 기본값은 '안전'
    return {
      className: "risk--safe", text: "안전", icon: "🛡️",
      description: "분석 결과 표절 위험이 매우 낮은 것으로 보입니다.",
      rotation: -60
    };
  };

  const details = getRiskDetails(riskLevel);

  return (
    <div className="cr-modal-risk-gauge-box">
      <h3 className="cr-modal-section-title">종합 위험도</h3>
      <div className="cr-modal-gauge-container">
        <div className="cr-modal-gauge-bg"></div>
        <div 
          className="cr-modal-gauge-needle" 
          style={{ '--needle-rotation': `${details.rotation}deg` }}
        ></div>
      </div>
      <div className="cr-modal-gauge-result">
        <div className="icon">{details.icon}</div>
        <p className={`text ${details.className}`}>{details.text}</p>
      </div>
      <p className="cr-modal-gauge-description">{details.description}</p>
    </div>
  );
};


const CopyrightModal = ({ isOpen, onClose, result }) => {
  const summaryData = useMemo(() => parseAnalysisSummary(result?.analysisSummary), [result]);
  if (!isOpen) return null;
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("cr-modal-overlay")) {
      onClose();
    }
  };
  const getSimilarityClass = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };
  const renderSummaryItem = (item, index) => { /* ... 기존과 동일 ... */ 
      if (item.type === 'recommendation') {
      return (
        <div key={index} className="cr-modal-summary-alert">
          <div className="alert-content">
            {item.title && <h4>{item.title}</h4>}
            {item.items.length > 0 && <ul>{item.items.map((li, i) => <li key={i}>{li}</li>)}</ul>}
          </div>
        </div>
      );
    }
    return (
      <div key={index} className="cr-modal-summary-card">
        {item.title && <h4>{item.title}</h4>}
        {item.content && <p>{item.content}</p>}
        {item.items.length > 0 && <ul>{item.items.map((li, i) => <li key={i}>{li}</li>)}</ul>}
      </div>
    );
  };

  return (
    <div className="cr-modal-overlay" onClick={handleOverlayClick}>
      <div className="cr-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="cr-modal-close-btn" onClick={onClose}>&times;</button>
        {!result ? <LoadingSkeleton /> : (
          <>
            <div className="cr-modal-sidebar">
              <div className="cr-modal-sidebar-header">
                <h2 className="cr-modal-sidebar-title">분석 결과</h2>
              </div>
              <div className="cr-modal-sidebar-content">
                
                {/* ✨ [변경] 기존 위험도 박스를 새로운 게이지 컴포넌트로 교체 */}
                <div className="cr-modal-content-section">
                  <RiskGauge riskLevel={result.riskLevel} />
                </div>

                <div className="cr-modal-content-section">
                  <h3 className="cr-modal-section-title">분석 요약</h3>
                  <div className="cr-modal-summary-container">
                    {summaryData.map(renderSummaryItem)}
                  </div>
                </div>

              </div>
            </div>

            <div className="cr-modal-main">
              {/* ... 우측 메인 콘텐츠는 변경 없음 ... */ }
               <h2 className="cr-modal-main-title">유사 게임 목록</h2>
              <ul className="cr-modal-similar-games-list">
                {result.similarGames?.length > 0 ? (
                  result.similarGames.map((game, idx) => (
                    <li key={idx} className="cr-modal-game-card" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="cr-modal-game-card-header">
                        <a href={game.bggLink} target="_blank" rel="noopener noreferrer" className="cr-modal-game-title">{game.title}</a>
                        <span className={`cr-modal-game-similarity ${getSimilarityClass(game.similarityScore)}`}>
                          {game.similarityScore.toFixed(1)}%
                        </span>
                      </div>
                      {game.overlappingElements?.length > 0 && (
                        <ul className="cr-modal-overlapping-elements">
                          {game.overlappingElements.map((el, i) => <li key={i}>{el}</li>)}
                        </ul>
                      )}
                    </li>
                  ))
                ) : <p className="cr-modal-no-data">유사한 게임을 찾을 수 없습니다.</p>}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CopyrightModal;