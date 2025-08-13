import React from 'react';
import ReactMarkdown from 'react-markdown';
import './PlanReport.css'; // 아래에서 만들 CSS 파일을 import 합니다.

/**
 * Markdown 형식의 기획서 내용을 보고서 스타일로 렌더링하는 컴포넌트
 * @param {{content: string}} props - content는 Markdown 형식의 텍스트입니다.
 */
const PlanReport = ({ content }) => {
  if (!content) {
    return (
      <div className="plan-report-placeholder">
        기획서 내용을 불러오는 중이거나, 생성된 내용이 없습니다.
      </div>
    );
  }

  return (
    <div className="plan-report-container">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default PlanReport;