// PricingEvaluation.jsx 가격 측정

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApprovedPlan } from '../api/auth';
import { completeProject } from '../api/publish';
import { ProjectContext } from '../contexts/ProjectContext';
import './PricingEvaluation.css';

function PricingEvaluation() {
  const navigate = useNavigate();
  const [completionMessage, setCompletionMessage] = useState('');
  const [completionError, setCompletionError] = useState('');
  const projectContext = useContext(ProjectContext);
  const projectId = projectContext?.projectId;
  const [pricingData, setPricingData] = useState({
    developmentCost: '',
    translationCost: '',
    marketingCost: '',
    platformFee: '',
    suggestedPrice: '',
    targetMargin: '',
    notes: ''
  });
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 프로젝트 ID가 있을 때 프로젝트 정보와 승인된 플랜 조회
  useEffect(() => {
    console.log('PricingEvaluation useEffect 실행:', { projectId, projectContext });
    if (projectId) {
      console.log('프로젝트 ID 확인됨:', projectId);
      fetchProjectInfo();
      // 자동 가격 추정 제거 - 사용자가 버튼으로 요청하도록 변경
      // fetchApprovedPlan();
    } else {
      console.log('프로젝트 ID가 없습니다.');
    }
  }, [projectId, projectContext]);

  const fetchProjectInfo = async () => {
    if (!projectId) return;

    try {
      console.log('프로젝트 정보 조회 시작:', projectId);
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`프로젝트 정보 조회 실패: ${response.status}`);
      }

      const projectData = await response.json();
      console.log('프로젝트 정보 조회 결과:', projectData);
      setProjectInfo(projectData);
    } catch (error) {
      console.error('프로젝트 정보 조회 오류:', error);
      // 프로젝트 정보 조회 실패해도 계속 진행
    }
  };

  const fetchApprovedPlan = async () => {
    if (!projectId) return;

    try {
      console.log('승인된 플랜 조회 시작:', projectId);
      const approvedPlan = await getApprovedPlan(projectId);
      console.log('승인된 플랜 조회 결과:', approvedPlan);

      if (approvedPlan && approvedPlan.planId) {
        console.log('플랜 ID 찾음:', approvedPlan.planId);
        // 자동 가격 추정 실행
        runAutoEstimate(approvedPlan.planId);
      } else {
        console.log('승인된 플랜이 없습니다.');
        alert('이 프로젝트는 승인된 플랜이 없어 가격 추정을 할 수 없습니다.');
      }
    } catch (error) {
      console.error('승인된 플랜 조회 오류:', error);
      alert(`플랜 조회 실패: ${error.message}`);
    }
  };

  const runAutoEstimate = async (planId) => {
    if (!planId) {
      console.log('planId가 없어 자동 가격 추정을 실행할 수 없습니다.');
      return;
    }

    try {
      console.log('자동 가격 추정 시작:', 'Project ID:', projectId, 'Plan ID:', planId);
      const response = await fetch('/api/pricing/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          planId: planId
        })
      });

      // if (!response.ok) {
      //   throw new Error(`가격 추정 실패: ${response.status}`);
      // }

      const result = await response.json();
      console.log('자동 가격 추정 결과:', result);

      // 추천 가격을 suggestedPrice에 자동 설정
      if (result.korPriceAsInt) {
        setPricingData(prev => ({
          ...prev,
          suggestedPrice: result.korPriceAsInt.toString()
        }));
      }
    } catch (error) {
      console.error('자동 가격 추정 오류:', error);
      alert(`자동 가격 추정 실패: ${error.message}`);
    }
  };

  // 가격 측정 요청 함수 추가
  const handlePriceEstimate = async () => {
    if (!projectId) {
      alert('프로젝트를 선택해주세요.');
      return;
    }

    try {
      // 승인된 플랜 조회 후 가격 측정 실행
      const approvedPlan = await getApprovedPlan(projectId);

      if (approvedPlan && approvedPlan.planId) {
        console.log('플랜 ID 찾음:', approvedPlan.planId);
        await runAutoEstimate(approvedPlan.planId);
      } else {
        alert('이 프로젝트는 승인된 플랜이 없어 가격 추정을 할 수 없습니다.');
      }
    } catch (error) {
      console.error('가격 측정 요청 오류:', error);
      alert(`가격 측정 요청 실패: ${error.message}`);
    }
  };

  // 프로젝트 완료 처리
  const handleCompleteProject = async () => {
    if (!projectId) {
      setCompletionError('❌ 프로젝트 ID가 없습니다.');
      return;
    }

    try {
      await completeProject(projectId);
      setCompletionMessage('✅ 프로젝트가 완료 처리되었습니다.');
      setCompletionError('');
      // navigate('/projects'); // 원하면 유지 or 제거
    } catch (error) {
      console.error('프로젝트 완료 처리 실패:', error);
      setCompletionError(`❌ 프로젝트 완료 처리 실패: ${error.message}`);
      setCompletionMessage('');
    }
  };

  const handleInputChange = (field, value) => {
    setPricingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalCost = () => {
    const dev = parseFloat(pricingData.developmentCost) || 0;
    const platformFee = parseFloat(pricingData.platformFee) || 0;
    const targetMargin = parseFloat(pricingData.targetMargin) || 0;

    // AI 가격 분석 결과에서 추천 가격 가져오기
    const suggestedPrice = pricingData.suggestedPrice ?
      Math.ceil(parseInt(pricingData.suggestedPrice) / 1000) * 1000 : 0;

    const totalCost = dev;
    const platformCost = (suggestedPrice * platformFee) / 100;

    // 목표 마진을 원으로 계산 (추천 가격에서 플랫폼 수수료를 제외한 금액의 목표 마진%)
    const revenueAfterPlatformFee = suggestedPrice - platformCost;
    const netRevenue = (revenueAfterPlatformFee * targetMargin) / 100;

    const profit = netRevenue;
    const marginPercent = targetMargin;

    return {
      totalCost,
      platformCost,
      netRevenue,
      profit,
      marginPercent,
      suggestedPrice
    };
  };

  const savePricingData = () => {
    if (!projectId) return;

    // 실제로는 API 호출
    alert(`프로젝트 ID ${projectId}의 가격 책정이 저장되었습니다.`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PUBLISHING': return '출판 준비';
      case 'DEVELOPMENT': return '개발 중';
      case 'PLANNING': return '기획 중';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="pricing-workspace">
        <main className="workspace-main-content">
          <div className="loading-container">
            <div className="loading-spinner">🔄</div>
            <h2>데이터를 불러오는 중...</h2>
            <p>잠시만 기다려주세요.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pricing-workspace">
        <main className="workspace-main-content">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h2>오류가 발생했습니다</h2>
            <p className="error-message">{error}</p>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              페이지 새로고침
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ProjectContext가 없거나 projectId가 없으면 메시지 표시
  if (!projectContext) {
    return (
      <div className="pricing-workspace">
        <main className="workspace-main-content">
          <div className="creator-container">
            <h2>가격 책정</h2>
            <p>프로젝트 컨텍스트를 찾을 수 없습니다.</p>
            <p>프로젝트 목록에서 프로젝트를 선택한 후 다시 시도해주세요.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="pricing-workspace">
        <main className="workspace-main-content">
          <div className="creator-container">
            <h2>가격 책정</h2>
            <p>프로젝트를 선택해주세요.</p>
            <p>현재 선택된 프로젝트 ID: {projectId}</p>
          </div>
        </main>
      </div>
    );
  }

  const calculations = calculateTotalCost();

  return (
    <div className="pricing-workspace">
      <main className="workspace-main-content">
        <div className="creator-container">
          {/* 폼 섹션 (왼쪽) */}
          <div className="form-column">
            <div className="form-section">
              <h2>가격 책정</h2>
              <p>AI 분석을 기반으로 최적의 가격을 설정하고 수익성을 분석합니다.</p>

              {/* 프로젝트 정보 */}
              <div className="selected-game-info">
                <h3>{projectInfo?.projectName || '프로젝트명 로딩 중...'}</h3>
                {projectInfo?.thumbnailUrl ? (
                  <div className="selected-thumbnail-container">
                    <img
                      src={projectInfo.thumbnailUrl}
                      alt={projectInfo.projectName || '프로젝트 이미지'}
                      className="selected-project-thumbnail"
                    />
                  </div>
                ) : (
                  <div className="selected-no-thumbnail">
                    <span className="no-image-icon">🖼️</span>
                    <p>이미지 없음</p>
                  </div>
                )}
              </div>

              {/* AI 가격 분석 결과 */}
              <div className="ai-pricing-result">
                <h2>AI 가격 분석 결과</h2>
                <h5>아마존 가격 데이터 기준으로 추천 가격을 제시합니다.</h5>

                {/* 가격 측정 버튼 추가 */}
                <div className="price-estimate-button-container">
                  <button
                    className="price-estimate-btn"
                    onClick={handlePriceEstimate}
                  >
                    AI 가격 측정 요청
                  </button>
                </div>

                <div className="price-recommendations">
                  <div className="price-item">
                    <span className="currency-label">추천 가격 (원)</span>
                    <span className="price-value krw">
                      {pricingData.suggestedPrice ?
                        Math.ceil(parseInt(pricingData.suggestedPrice) / 1000) * 1000 :
                        '---'
                      }원
                    </span>
                  </div>
                  <div className="price-item">
                    <span className="currency-label">추천 가격 (달러)</span>
                    <span className="price-value usd">
                      {pricingData.suggestedPrice ?
                        `$${(parseInt(pricingData.suggestedPrice) / 1300).toFixed(2)}` :
                        '---'
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="complete-project-container" style={{ marginTop: "20px" }}>
                <button
                  className="finish-project-btn"
                  onClick={handleCompleteProject}
                >
                  프로젝트 완료하기
                </button>
                {/* 완료/에러 메시지 표시 */}
                {completionMessage && (
                  <p className="completion-message success">{completionMessage}</p>
                )}
                {completionError && (
                  <p className="completion-message error">{completionError}</p>
                )}
              </div>
            </div>
          </div>

          {/* 결과 섹션 (오른쪽) */}
          <div className="result-column">
            {/* 비용 입력 폼 */}
            <div className="pricing-form">
              <h2>비용 입력</h2>
              <div className="form-group">
                <label>개발 비용 (원)</label>
                <input
                  type="number"
                  value={pricingData.developmentCost}
                  onChange={(e) => handleInputChange('developmentCost', e.target.value)}
                  placeholder="개발 비용을 입력하세요"
                />
              </div>

              <div className="form-group">
                <label>플랫폼 수수료 (%)</label>
                <input
                  type="number"
                  value={pricingData.platformFee}
                  onChange={(e) => handleInputChange('platformFee', e.target.value)}
                  placeholder="30"
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>목표 마진 (%)</label>
                <input
                  type="number"
                  value={pricingData.targetMargin}
                  onChange={(e) => handleInputChange('targetMargin', e.target.value)}
                  placeholder="40"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="pricing-calculations">
              <h2>수익성 분석</h2>
              <div className="calculation-item">
                <span className="label">개발비:</span>
                <span className="value">{calculations.totalCost.toLocaleString()}원</span>
              </div>
              <div className="calculation-item">
                <span className="label">플랫폼 수수료:</span>
                <span className="value">{calculations.platformCost.toLocaleString()}원</span>
              </div>
              <div className="calculation-item">
                <span className="label">목표 마진:</span>
                <span className="value">{calculations.netRevenue.toLocaleString()}원</span>
              </div>
              <div className="calculation-item total-cost">
                <span className="label">총 비용 (개발비 + 플랫폼 수수료 + 목표 마진):</span>
                <span className="value total-value">
                  {(calculations.totalCost + calculations.platformCost + calculations.netRevenue).toLocaleString()}원
                </span>
              </div>
              <div className="calculation-divider">
                <span>-------</span>
              </div>
              <div className="calculation-item profit-difference">
                <span className="label">추천 가격 - 총비용 차이:</span>
                <span className={`value ${(calculations.suggestedPrice - (calculations.totalCost + calculations.platformCost + calculations.netRevenue)) >= 0 ? 'positive' : 'negative'}`}>
                  {(calculations.suggestedPrice - (calculations.totalCost + calculations.platformCost + calculations.netRevenue)).toLocaleString()}원
                </span>
                <div className="profit-explanation">
                  {calculations.suggestedPrice - (calculations.totalCost + calculations.platformCost + calculations.netRevenue) >= 0 ?
                    '✅ 추천 가격에 비해 총 가격이 낮습니다.' :
                    '❌ 추천 가격에 비해 총 가격이 높습니다.'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PricingEvaluation;
