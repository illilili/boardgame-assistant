import React from 'react';
import './DevelopmentListViewer.css'; // 전용 CSS 파일을 import 합니다.

// --- 개발 항목 더미 데이터 ---
// [수정] 보드게임 개발에 특화된 항목으로 데이터를 변경했습니다.
const dummyDevItems = [
  {
    id: 'dev-01',
    category: '룰북 생성',
    taskName: '프로젝트: 크리스탈 가디언즈 룰북 초안 v1 생성',
    relatedPlan: '프로젝트: 크리스탈 가디언즈',
    assignee: '김기획',
    dueDate: '2025-08-10',
    status: '완료', 
  },
  {
    id: 'dev-02',
    category: '콘텐츠 생성',
    taskName: '크리스탈 가디언즈 "가디언 카드" 10종 문구 생성',
    relatedPlan: '프로젝트: 크리스탈 가디언즈',
    assignee: '김기획',
    dueDate: '2025-08-15',
    status: '진행중',
  },
  {
    id: 'dev-03',
    category: '이미지 생성',
    taskName: '크리스탈 가디언즈 "가디언 카드" 10종 이미지 생성',
    relatedPlan: '프로젝트: 크리스탈 가디언즈',
    assignee: '박모델',
    dueDate: '2025-08-22',
    status: '대기중',
  },
  {
    id: 'dev-04',
    category: '스크립트 생성',
    taskName: '우주 대탐험: 안드로메다 튜토리얼 스크립트 작성',
    relatedPlan: '우주 대탐험: 안드로메다',
    assignee: '이탐정',
    dueDate: '2025-08-25',
    status: '진행중',
  },
  {
    id: 'dev-05',
    category: '3D 모델 생성',
    taskName: '우주 대탐험 "탐사선" 3D 모델링 및 렌더링',
    relatedPlan: '우주 대탐험: 안드로메다',
    assignee: '박모델',
    dueDate: '2025-09-01',
    status: '대기중',
  },
  {
    id: 'dev-06',
    category: '이미지 생성',
    taskName: '미스터리 맨션 살인사건 홍보용 썸네일 이미지 생성',
    relatedPlan: '미스터리 맨션 살인사건',
    assignee: '김디자인',
    dueDate: '2025-08-28',
    status: '보류',
  },
];

// 상태(status)에 따라 다른 스타일을 적용하기 위한 함수
const getStatusClassName = (status) => {
  switch (status) {
    case '진행중':
      return 'status-in-progress';
    case '완료':
      return 'status-completed';
    case '대기중':
      return 'status-waiting';
    case '보류':
      return 'status-on-hold';
    default:
      return '';
  }
};


function DevelopmentListViewer() {
  return (
    <div className="component-placeholder">
      <h2>[개발] 개발 목록 조회</h2>
      <p>현재 진행 중인 모든 개발 항목의 목록과 상태를 확인합니다.</p>
      
      <div className="dev-list-container">
        {/* 헤더 부분 */}
        <div className="dev-list-header">
          <span className="header-category">카테고리</span>
          <span className="header-task">개발 항목</span>
          <span className="header-assignee">담당자</span>
          <span className="header-due-date">마감일</span>
          <span className="header-status">상태</span>
        </div>
        
        {/* 목록 부분 */}
        <ul className="dev-list">
          {dummyDevItems.map(item => (
            <li key={item.id} className="dev-list-item">
              <span className="item-category">{item.category}</span>
              <div className="item-task-group">
                <span className="item-task-name">{item.taskName}</span>
                <span className="item-related-plan">{item.relatedPlan}</span>
              </div>
              <span className="item-assignee">{item.assignee}</span>
              <span className="item-due-date">{item.dueDate}</span>
              <span className="item-status">
                <span className={`status-badge ${getStatusClassName(item.status)}`}>
                  {item.status}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DevelopmentListViewer;