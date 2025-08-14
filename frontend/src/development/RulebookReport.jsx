import React from "react";
import ReactMarkdown from "react-markdown";
import "./RulebookReport.css"; // 선택 (스타일 주고 싶으면)

function RulebookReport({ content }) {
  if (!content) {
    return <div className="rulebook-report">내용이 없습니다.</div>;
  }
  return (
    <div className="rulebook-report">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default RulebookReport;