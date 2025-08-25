import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Development.css';

import ApprovedPlanViewer from './ApprovedPlanViewer';
import FileUploadPage from './FileUploadPage';
import DevelopmentListViewer from './DevelopmentListViewer';
import RulebookGenerator from './RulebookGenerator';
import ComponentGenerator from './ComponentGenerator';
import ModelGenerator from './ModelGenerator';
import ThumbnailGenerator from './ThumbnailGenerator';
import { ProjectContext } from '../contexts/ProjectContext';
import Header from '../mainPage/Header';

// 시작 화면 컴포넌트
function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">🚀</div>
      <h2>게임 개발을 시작해 보세요</h2>
      <p>
        왼쪽 메뉴에서 원하는 개발 작업을 선택하여 프로젝트를 진행할 수 있습니다.
        각 단계에 맞춰 필요한 콘텐츠를 생성하고 관리해 보세요.
      </p>
      <button className="welcome-start-button" onClick={onStart}>
        개발 시작하기
      </button>
    </div>
  );
}

// 네비게이션 아이템 정의
const workspaceNavItems = [
  { id: 'approved-plan', title: '승인된 기획안 조회', component: <ApprovedPlanViewer /> },
  { id: 'dev-list', title: '개발 목록 조회', component: <DevelopmentListViewer /> },
  { id: 'card-gen', title: '카드 생성', component: <ComponentGenerator /> },
  { id: 'rulebook-gen', title: '룰북 초안 생성', component: <RulebookGenerator /> },
  { id: 'model-gen', title: '3D 모델 생성', component: <ModelGenerator /> },
  { id: 'thumbnail-gen', title: '썸네일 이미지 생성', component: <ThumbnailGenerator /> },
  { id: 'file-upload', title: '파일 업로드', component: <FileUploadPage /> },
];

/**
 * Development 메인
 * - 선택 데이터는 객체 형태로 로컬스토리지에 저장하여 (콘텐츠/컴포넌트) 모두 보존
 *   저장 키: 'selectedContentId' (구버전 호환을 위해 키 이름 유지)
 * - 카드: { textContentId, imageContentId, componentId }
 * - 일반: { contentId, componentId }
 */
function Development() {
  const { projectId } = useContext(ProjectContext);
  const navigate = useNavigate();

  // 현재 화면
  const [activeViewId, setActiveViewId] = useState(
    () => localStorage.getItem('activeViewId') || null
  );

  // 현재 선택된 작업(콘텐츠/컴포넌트 통합 객체)
  const [selectedWork, setSelectedWork] = useState(() => {
    const saved = localStorage.getItem('selectedContentId');
    try {
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // 정상적인 객체 저장본
      if (parsed && typeof parsed === 'object') return parsed;
      // 구버전: contentId만 문자열/숫자로 저장돼 있던 경우
      return parsed ? { contentId: parsed } : null;
    } catch {
      // 파싱 실패 시, 문자열 그대로 contentId로 간주
      return saved ? { contentId: saved } : null;
    }
  });

  /**
   * 화면 전환 + 선택 데이터 저장
   * @param {string} viewId - 이동할 화면 ID
   * @param {object|null} payload - 선택 데이터 (카드/일반 통합)
   */
  const handleNavigate = (viewId, payload = null) => {
    setActiveViewId(viewId);
    setSelectedWork(payload);

    localStorage.setItem('activeViewId', viewId);
    localStorage.setItem('selectedContentId', JSON.stringify(payload ?? ''));
  };

  const activeView = activeViewId
    ? workspaceNavItems.find(item => item.id === activeViewId)
    : null;

  return (
    <div className="development-page">
      <Header projectMode={true} />
      <div className="workspace-container new-design">
        <aside className="dev-workspace-sidebar">
          <div className="sidebar-header">
            <div
              className="dev-logo"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              DEVELOP
            </div>
          </div>
          <ul className="workspace-nav-list">
            {workspaceNavItems.map((item) => (
              <li
                key={item.id}
                className={`dev-nav-item ${activeViewId === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </aside>

        <main className="workspace-main-content">
          {activeViewId === 'dev-list' ? (
            <DevelopmentListViewer onNavigate={handleNavigate} projectId={projectId} />
          ) : activeView ? (
            activeViewId === 'card-gen'
              ? React.cloneElement(activeView.component, {
                // ✅ 카드 생성 화면: 두 콘텐츠 ID + 컴포넌트 ID 전달
                textContentId: selectedWork?.textContentId ?? null,
                imageContentId: selectedWork?.imageContentId ?? null,
                componentId: selectedWork?.componentId ?? null,
                projectId,
              })
              : React.cloneElement(activeView.component, {
                // ✅ 일반 화면: 콘텐츠/컴포넌트 ID 전달
                contentId:
                  typeof selectedWork === 'object'
                    ? (selectedWork?.contentId ?? null)
                    : (selectedWork ?? null), // 구버전 호환
                componentId:
                  typeof selectedWork === 'object'
                    ? (selectedWork?.componentId ?? null)
                    : null,
                projectId,
              })
          ) : (
            <WelcomeScreen onStart={() => handleNavigate('approved-plan')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default Development;