import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Button, Typography, Space, Divider } from 'antd';
import { 
  ExperimentOutlined, 
  FilterOutlined, 
  DashboardOutlined,
  BulbOutlined,
  HomeOutlined,
  BarChartOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// API 서비스 imports
import {
  fetchInteractiveDashboardInitData,
  fetchInteractiveVisualizationUpdate,
  formatTrendApiError
} from '../../services/trendApiService';

// 컴포넌트 imports
import FilterControlPanel from './FilterControlPanel';
import BubbleChartVisualization from './BubbleChartVisualization';
import GameResultsList from './GameResultsList';

// 스타일 imports
import './InteractiveDashboard.css';

const { Title, Paragraph, Text } = Typography;

/**
 * 인터랙티브 트렌드 분석 대시보드 메인 컴포넌트
 * 
 * 기능:
 * - 동적 필터링 (난이도, 플레이어 수, 카테고리, 메카닉)
 * - 실시간 시각화 업데이트 (버블차트, 히트맵)
 * - 필터링된 게임 목록 표시
 * - 전역 상태 관리를 통한 컴포넌트 간 데이터 동기화
 */
const InteractiveDashboard = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initData, setInitData] = useState(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    complexityMin: 1.0,
    complexityMax: 5.0,
    players: [],
    categories: [],
    mechanics: [],
    limit: 500,
    groupBy: 'categories', // 버블차트 그룹화 기준
    sortBy: 'geek_rating',
    sortOrder: 'desc'
  });
  
  // 시각화 데이터 상태
  const [visualizationData, setVisualizationData] = useState({
    filteredGames: [],
    bubbleData: []
  });
  
  // 업데이트 로딩 상태
  const [updating, setUpdating] = useState(false);

  /**
   * 초기 데이터 로딩
   */
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 인터랙티브 대시보드 초기화 시작...');
      
      const data = await fetchInteractiveDashboardInitData();
      
      console.log('✅ 초기 데이터 로딩 완료:', data);
      
      setInitData(data);
      setVisualizationData({
        filteredGames: data.initialGames || [],
        bubbleData: data.initialBubbleData || []
      });
      
    } catch (err) {
      console.error('❌ 대시보드 초기화 실패:', err);
      setError(formatTrendApiError(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 필터 변경 핸들러
   */
  const handleFiltersChange = async (newFilters) => {
    try {
      setUpdating(true);
      
      console.log('🔄 필터 변경 감지:', newFilters);
      
      // 업데이트될 최종 필터 값 계산
      const updatedFilters = { ...filters, ...newFilters };
      console.log('🔧 최종 업데이트 필터:', updatedFilters);
      
      // 필터 상태 업데이트
      setFilters(updatedFilters);
      
      // 시각화 데이터 업데이트
      const updatedData = await fetchInteractiveVisualizationUpdate(updatedFilters);
      
      console.log('✅ 시각화 데이터 업데이트 완료:', updatedData);
      
      setVisualizationData({
        filteredGames: updatedData.filteredGames || [],
        bubbleData: updatedData.bubbleData || []
      });
      
    } catch (err) {
      console.error('❌ 필터 업데이트 실패:', err);
      // 에러가 발생해도 필터 상태는 유지
      setError(formatTrendApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  /**
   * 필터 초기화
   */
  const handleFiltersReset = () => {
    const defaultFilters = {
      complexityMin: 1.0,
      complexityMax: 5.0,
      players: [],
      categories: [],
      mechanics: [],
      limit: 500,
      groupBy: 'categories',
      sortBy: 'geek_rating',
      sortOrder: 'desc'
    };
    
    setFilters(defaultFilters);
    handleFiltersChange(defaultFilters);
  };

  /**
   * 데이터 새로고침
   */
  const handleRefresh = () => {
    initializeDashboard();
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="interactive-dashboard-loading">
        <Spin size="large" />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text>인터랙티브 대시보드를 로딩 중입니다...</Text>
          <br />
          <Text type="secondary">데이터 초기화에 몇 초가 걸릴 수 있습니다.</Text>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && !initData) {
    return (
      <div className="interactive-dashboard-error">
        <Alert
          message="데이터 로딩 실패"
          description={error}
          type="error"
          action={
            <Button type="primary" onClick={handleRefresh}>
              다시 시도
            </Button>
          }
        />
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button 
            icon={<HomeOutlined />} 
            onClick={() => navigate('/trend')}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-dashboard">
      {/* 헤더 섹션 */}
      <div className="dashboard-header">
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space size="middle">
              <Button 
                icon={<HomeOutlined />} 
                onClick={() => navigate('/trend')}
                type="default"
              >
                트렌드 홈
              </Button>
              
              <Divider type="vertical" />
              
              <Title level={2} style={{ margin: 0 }}>
                <ExperimentOutlined /> 인터랙티브 트렌드 탐색
              </Title>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Button 
                icon={<BulbOutlined />} 
                type="primary" 
                ghost
                onClick={handleRefresh}
                loading={loading}
              >
                새로고침
              </Button>
              
              <Button 
                icon={<FilterOutlined />} 
                onClick={handleFiltersReset}
                disabled={updating}
              >
                필터 초기화
              </Button>
            </Space>
          </Col>
        </Row>

        <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: 24 }}>
          <DashboardOutlined /> 실시간으로 보드게임을 필터링하고 시각화하여 트렌드를 탐색하세요.
          <br />
          <Text code>10,000개 보드게임 데이터</Text>를 기반으로 한 인터랙티브 분석 도구입니다.
        </Paragraph>

        {/* 현재 상태 표시 */}
        <div className="dashboard-status">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <Card size="small" className="status-card">
                <Space>
                  <AppstoreOutlined />
                  <div>
                    <div className="status-number">
                      {visualizationData.filteredGames.length}
                    </div>
                    <div className="status-label">필터링된 게임</div>
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} sm={8} md={6}>
              <Card size="small" className="status-card">
                <Space>
                  <BarChartOutlined />
                  <div>
                    <div className="status-number">
                      {initData?.categories?.length || 0}
                    </div>
                    <div className="status-label">전체 카테고리</div>
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} sm={8} md={6}>
              <Card size="small" className="status-card">
                <Space>
                  <AppstoreOutlined />
                  <div>
                    <div className="status-number">
                      {initData?.mechanics?.length || 0}
                    </div>
                    <div className="status-label">전체 메카닉</div>
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} sm={8} md={6}>
              <Card size="small" className="status-card">
                <Space>
                  <ExperimentOutlined />
                  <div>
                    <div className="status-number">
                      {filters.complexityMin}-{filters.complexityMax}
                    </div>
                    <div className="status-label">난이도 범위</div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* 에러 표시 (데이터는 있지만 업데이트 중 에러가 발생한 경우) */}
      {error && (
        <Alert
          message="데이터 업데이트 중 오류 발생"
          description={error}
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 메인 컨텐츠 */}
      <Row gutter={[24, 24]}>
        {/* 필터 컨트롤 패널 */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <FilterOutlined />
                필터 설정
              </Space>
            }
            className="filter-panel-card"
            loading={updating}
          >
            <FilterControlPanel
              categories={initData?.categories || []}
              mechanics={initData?.mechanics || []}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              loading={updating}
            />
          </Card>
        </Col>

        {/* 시각화 영역 */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 버블 차트 */}
            <Card 
              title={
                <Space>
                  <BarChartOutlined />
                  평점 vs 난이도 분포 (버블차트)
                </Space>
              }
              extra={
                <Text type="secondary">
                  그룹별 게임 분포 시각화
                </Text>
              }
              className="visualization-card"
            >
              <BubbleChartVisualization
                data={visualizationData.bubbleData}
                loading={updating}
                filters={filters}
              />
            </Card>

          </Space>
        </Col>
      </Row>

      {/* 게임 결과 목록 */}
      <Row style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <AppstoreOutlined />
                필터링 결과 ({visualizationData.filteredGames.length}개 게임)
              </Space>
            }
            extra={
              <Text type="secondary">
                현재 필터 조건에 맞는 게임들
              </Text>
            }
            className="results-list-card"
          >
            <GameResultsList
              games={visualizationData.filteredGames}
              loading={updating}
              filters={filters}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InteractiveDashboard;