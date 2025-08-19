// src/mypage/MyPage.jsx
import React, { useState as useStateMyPage, useEffect as useEffectMyPage } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPageInfo as apiGetMyPageInfo } from '../api/auth.js';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './MyPage.css';
import '../project/ProjectListPage.css';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

const MyPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useStateMyPage(null);
  const [loading, setLoading] = useStateMyPage(true);
  const [error, setErrorMyPage] = useStateMyPage('');

  useEffectMyPage(() => {
    const fetchMyPageData = async () => {
      try {
        const data = await apiGetMyPageInfo();
        setUserData(data);
      } catch (err) {
        setErrorMyPage(err.message || '마이페이지 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPageData();
  }, []);

  if (loading) return <div className="mypage-loading">로딩 중...</div>;
  if (error) return <div className="mypage-error">{error}</div>;

  return (
    <>
      <Header />
      <div className="mypage-container">
        <div className="mypage-card">
          <h1 className="mypage-title">마이페이지</h1>

          {userData && (
            <>
              {/* 기본 정보 */}
              <div className="mypage-section">
                <h2 className="mypage-section-title">기본 정보</h2>
                <div className="mypage-info-box">
                  <p><strong>이름:</strong> {userData.userName}</p>
                  <p><strong>이메일:</strong> {userData.email}</p>
                  <p><strong>회사:</strong> {userData.company || '미입력'}</p>
                  <p><strong>역할:</strong> {userData.role}</p>
                </div>
              </div>

              {/* 참여중인 프로젝트 */}
              <div className="mypage-section">
                <h2 className="mypage-section-title">
                  참여중인 프로젝트 ({userData.participatingProjects.length}개)
                </h2>
                {userData.participatingProjects.length > 0 ? (
                  <div className="project-list-page__grid">
                    {userData.participatingProjects.map(project => (
                      <div
                        key={project.projectId}
                        className="project-list-page__card"
                        onClick={() => navigate(`/projects/${project.projectId}`)}
                      >
                        {/* ✅ 썸네일 추가 */}
                        <img
                          src={project.thumbnailUrl || DEFAULT_THUMBNAIL}
                          alt={`${project.projectName} 썸네일`}
                          className="project-list-page__thumbnail"
                        />
                        <h3 className="project-list-page__card-title">{project.projectName}</h3>
                        <span
                          className={`project-list-page__status-badge status--${project.status.toLowerCase()}`}
                        >
                          {project.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mypage-empty-text">아직 참여중인 프로젝트가 없습니다.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyPage;
