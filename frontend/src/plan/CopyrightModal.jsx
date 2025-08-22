import React from 'react';
import ReactMarkdown from 'react-markdown';
import './CopyrightModal.css';

const CopyrightModal = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("copyright-modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="copyright-modal-overlay" onClick={handleOverlayClick}>
      <div className="copyright-modal" onClick={(e) => e.stopPropagation()}>
        <h2>저작권 검토 결과</h2>

          <div className="copyright-section risk-level">
            <p>
              <strong>위험도:</strong>{' '}
              <span
                className={
                  result.riskLevel === "SAFE"
                    ? "risk-safe"
                    : result.riskLevel === "CAUTION"
                      ? "risk-caution"
                      : "risk-danger"
                }
              >
                {result.riskLevel}
              </span>
            </p>
          </div>
        

        <div className="copyright-section analysis-summary">
          <h3>요약</h3>
          <div className="markdown-content">
            <ReactMarkdown>{result.analysisSummary}</ReactMarkdown>
          </div>
        </div>

        <div className="copyright-section similar-games">
          <h3>유사 게임 목록</h3>
          <ul>
            {result.similarGames?.map((game, idx) => (
              <li key={idx}>
                <a href={game.bggLink} target="_blank" rel="noopener noreferrer">
                  {game.title}
                </a>{" "}
                ({game.similarityScore.toFixed(1)}%)
                {game.overlappingElements?.length > 0 && (
                  <ul>
                    {game.overlappingElements.map((el, i) => (
                      <li key={i}>{el}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>


        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default CopyrightModal;
