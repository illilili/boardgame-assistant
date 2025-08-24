import React, { useState } from 'react';
import Header from '../../mainPage/Header';
import PlanReviewsList from './PlanReviewsList';
import PlanReviewDetail from './PlanReviewDetail';
import DeveloperAssignList from './DeveloperAssignList'
import ComponentReviewDetail from './ComponentReviewDetail';
import ComponentReviewsList from './ComponentReviewsList';
import './ReviewsHome.css';

export default function ReviewsHome() {
  const [view, setView] = useState('plan-list'); 
  const [selectedId, setSelectedId] = useState(null);

  const goPlanList = () => { setView('plan-list'); setSelectedId(null); };
  const goCompList = () => { setView('comp-list'); setSelectedId(null); };
  const goDevAssign = () => { setView('dev-assign'); setSelectedId(null); };

  let content;
  switch (view) {
    case 'plan-list':
      content = <PlanReviewsList onSelect={(id) => { setSelectedId(id); setView('plan-detail'); }} />;
      break;
    case 'plan-detail':
      content = <PlanReviewDetail planId={selectedId} onBack={goPlanList} />;
      break;
    case 'comp-list':
      content = <ComponentReviewsList onSelect={(id) => { setSelectedId(id); setView('comp-detail'); }} />;
      break;
    case 'comp-detail':
      content = <ComponentReviewDetail componentId={selectedId} onBack={goCompList} />;
      break;
    case 'dev-assign':
      content = <DeveloperAssignList />;
      break;
    default:
      content = <div style={{ padding: '2rem' }}>메뉴를 선택해주세요.</div>;
  }

  return (
    <>
      <Header projectMode={false} />
      <div className="reviews-nav">
        <div
          className={`reviews-tab ${view.startsWith('plan') ? 'active' : ''}`}
          onClick={goPlanList}
        >
          기획안 승인
        </div>
        <div
          className={`reviews-tab ${view.startsWith('comp') ? 'active' : ''}`}
          onClick={goCompList}
        >
          컴포넌트 승인
        </div>
        <div
          className={`reviews-tab ${view.startsWith('dev') ? 'active' : ''}`}
          onClick={goDevAssign}
        >
          개발자 배정
        </div>
      </div>
      <div className="reviews-content">
        {content}
      </div>
    </>
  );
}
