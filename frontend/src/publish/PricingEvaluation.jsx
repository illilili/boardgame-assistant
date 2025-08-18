// PricingEvaluation.jsx 가격 측정

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProjects, getApprovedPlan } from '../api/auth';
import './PricingEvaluation.css';

function PricingEvaluation() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [pricingData, setPricingData] = useState({
    developmentCost: '',
    translationCost: '',
    marketingCost: '',
    platformFee: '',
    suggestedPrice: '',
    targetMargin: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 프로젝트 목록 로드
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('프로젝트 데이터 로딩 시작...');
        
        // 토큰 상태 확인
        const token = localStorage.getItem('accessToken');
        console.log('액세스 토큰 존재 여부:', !!token);
        if (token) {
          console.log('토큰 길이:', token.length);
          console.log('토큰 시작 부분:', token.substring(0, 20) + '...');
        }
        
        // API 호출 전 상태 확인
        console.log('getMyProjects 함수 타입:', typeof getMyProjects);
        console.log('API 호출 시작...');
        
        const projectData = await getMyProjects();
        console.log('getMyProjects API 응답:', projectData);
        console.log('응답 타입:', typeof projectData);
        console.log('응답 길이:', Array.isArray(projectData) ? projectData.length : '배열이 아님');
        
        if (!projectData) {
          throw new Error('API 응답이 null 또는 undefined입니다.');
        }
        
        if (!Array.isArray(projectData)) {
          throw new Error(`API 응답이 배열이 아닙니다. 타입: ${typeof projectData}`);
        }
        
        if (projectData.length === 0) {
          console.log('프로젝트 데이터가 비어있습니다.');
          setProjects([]);
          setLoading(false);
          return;
        }
        
        // 각 프로젝트의 구조 상세 로깅
        projectData.forEach((project, index) => {
          console.log(`프로젝트 ${index + 1} 상세 구조:`, {
            projectId: project.projectId,
            projectName: project.projectName,
            status: project.status,
            description: project.description,
            thumbnailUrl: project.thumbnailUrl,
            전체데이터: project
          });
        });
        
        setProjects(projectData);
        console.log('프로젝트 상태 업데이트 완료:', projectData.length, '개');
        
      } catch (err) {
        console.error('프로젝트 로드 오류:', err);
        console.error('오류 상세:', {
          message: err.message,
          stack: err.stack,
          projectName: err.projectName
        });
        setError(`프로젝트 목록을 불러오는 데 실패했습니다: ${err.message}`);
        
        // 오류 발생 시 더미 데이터로 테스트
        console.log('더미 데이터로 테스트 진행...');
        const dummyProjects = [
          {
            projectId: 1,
            projectName: "테스트 프로젝트 1",
            description: "이것은 테스트용 프로젝트입니다.",
            status: "PLANNING",
            thumbnailUrl: null
          },
          {
            projectId: 2,
            projectName: "테스트 프로젝트 2", 
            description: "두 번째 테스트용 프로젝트입니다.",
            status: "DEVELOPMENT",
            thumbnailUrl: null
          }
        ];
        setProjects(dummyProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 프로젝트 선택 시 자동 가격 추정 실행
  useEffect(() => {
    if (selectedProject) {
      console.log('프로젝트 선택됨, 승인된 플랜 조회:', selectedProject.projectName);
      fetchApprovedPlan();
    }
  }, [selectedProject]);

  const fetchApprovedPlan = async () => {
    if (!selectedProject) return;

    try {
      console.log('승인된 플랜 조회 시작:', selectedProject.projectId);
      const approvedPlan = await getApprovedPlan(selectedProject.projectId);
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
      console.log('자동 가격 추정 시작:', selectedProject.projectName, 'Plan ID:', planId);
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

      if (!response.ok) {
        throw new Error(`가격 추정 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('자동 가격 추정 결과:', result);
      
      // 추천 가격을 suggestedPrice에 자동 설정
      if (result.korPriceAsInt) {
        setPricingData(prev => ({
          ...prev,
          suggestedPrice: result.korPriceAsInt.toString()
        }));
      }
      
      // alert('자동 가격 추정이 완료되었습니다!');
    } catch (error) {
      console.error('자동 가격 추정 오류:', error);
      alert(`자동 가격 추정 실패: ${error.message}`);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    
    // 프로젝트 선택 시 가격 데이터 초기화
    setPricingData({
      developmentCost: '',
      translationCost: '',
      marketingCost: '',
      platformFee: '',
      suggestedPrice: '',
      targetMargin: '',
      notes: ''
    });
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
    if (!selectedProject) return;

    // 실제로는 API 호출
    alert(`${selectedProject.projectName}의 가격 책정이 저장되었습니다.`);
  };

  const getStatusText = (status) => {
    switch(status) {
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
            <h2>프로젝트 목록을 불러오는 중...</h2>
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

  if (!projects || projects.length === 0) {
    return (
      <div className="pricing-workspace">
        <main className="workspace-main-content">
          <div className="no-projects-container">
            <div className="no-projects-icon">📋</div>
            <h2>프로젝트가 없습니다</h2>
            <p>가격 책정할 프로젝트가 존재하지 않습니다.</p>
            <p>새로운 프로젝트를 생성하거나 다른 페이지로 이동해주세요.</p>
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
          <div className="form-column">
            <div className="form-section">
              <h2>프로젝트 선택</h2>
              <div className="game-cards-grid">
                {projects.map(project => (
                  <div 
                    key={project.projectId}
                    className={`game-card ${selectedProject?.projectId === project.projectId ? 'selected' : ''}`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="game-card-header">
                      <h3 className="game-title">{project.projectName}</h3>
                    </div>
                    <div className="game-card-content">
                      {project.thumbnailUrl ? (
                        <div className="thumbnail-container">
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.projectName}
                            className="project-thumbnail"
                          />
                        </div>
                      ) : (
                        <div className="no-thumbnail">
                          <span className="no-image-icon">🖼️</span>
                          <p>이미지 없음</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="result-column">
            {selectedProject ? (
              <div className="pricing-management">
                <div className="selected-game-info">
                  <h3>{selectedProject.projectName}</h3>
                  {selectedProject.thumbnailUrl ? (
                    <div className="selected-thumbnail-container">
                      <img 
                        src={selectedProject.thumbnailUrl} 
                        alt={selectedProject.projectName}
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
                  <h2>비슷한 보드게임 AI 가격 분석 결과</h2>
                  <h5>아마존 가격 데이터 기준으로 추천 가격을 제시합니다.</h5>
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
            ) : (
              <div className="welcome-screen">
                <div className="welcome-icon"></div>
                <h2>가격 책정 관리</h2>
                <p>프로젝트를 선택하여 비용을 입력하고 최적의 판매가를 책정하세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PricingEvaluation;
