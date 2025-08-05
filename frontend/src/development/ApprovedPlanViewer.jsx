import React from 'react';
import './ApprovedPlanViewer.css'; // 기존 CSS 재사용

// --- 변경된 구조의 더미 데이터 ---
// 실제로는 API로 planId와 planDocUrl을 받아옵니다.
// UI 표시를 위해 title, author 등 추가 정보를 함께 받아온다고 가정하겠습니다.
const dummyDocumentPlans = [
  {
    planId: 101,
    title: '프로젝트: 크리스탈 가디언즈',
    author: '김기획',
    approvedDate: '2024-07-15',
    planDocUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // 예시 PDF 링크
  },
  {
    planId: 102,
    title: '우주 대탐험: 안드로메다',
    author: '박개발',
    approvedDate: '2024-07-28',
    planDocUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // 예시 PDF 링크
  },
  {
    planId: 103,
    title: '미스터리 맨션 살인사건',
    author: '이탐정',
    approvedDate: '2024-08-02',
    planDocUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // 예시 PDF 링크
  },
];


// onPrivacyClick과 onTermsClick prop은 기획안 조회와 별개로 배치될 수 있으므로 유지합니다.
function ApprovedPlanViewer({ onPrivacyClick, onTermsClick }) {

  // 기획안 문서를 새 탭에서 여는 함수
  const openPlanDocument = (url) => {
    // 유효한 URL이 있을 때만 새 탭을 엽니다.
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('문서 URL이 유효하지 않습니다.');
    }
  };

  return (
    // 기존 component-placeholder 클래스를 그대로 사용합니다.
    <div className="component-placeholder">
      <h2>[개발] 승인된 기획안 문서조회</h2>
      <p>개발이 승인된 기획안 목록입니다. 항목을 클릭하면 새 탭에서 기획안 문서를 엽니다.</p>

      {/* 기획안 목록 */}
      <div className="plan-list-container">
        <ul className="plan-list">
          {dummyDocumentPlans.map(plan => (
            <li 
              key={plan.planId} 
              onClick={() => openPlanDocument(plan.planDocUrl)} 
              className="plan-list-item"
              title={`${plan.title} 문서 열기`} // 마우스를 올렸을 때 팁 표시
            >
              <span className="plan-title">{plan.title} (ID: {plan.planId})</span>
              <span className="plan-author">{plan.author}</span>
              <span className="plan-date">{plan.approvedDate}</span>
            </li>
          ))}
        </ul>
      </div>

     
    </div>
  );
}

export default ApprovedPlanViewer;