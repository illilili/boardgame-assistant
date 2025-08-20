import React, { useState, useMemo } from 'react';
import { Scatter } from '@ant-design/plots';
import { Card, Spin, Empty, Alert, Space, Typography, Tooltip, Button, Select, Modal, Table, Tag, Divider } from 'antd';
import { 
  InfoCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';

import './BubbleChartVisualization.css';

const { Text } = Typography;
const { Option } = Select;

/**
 * 버블차트 시각화 컴포넌트
 * 
 * 기능:
 * - X축: 평균 평점, Y축: 평균 난이도, 크기: 게임 수
 * - 그룹별 색상 구분 (카테고리 또는 메카닉)
 * - 인터랙티브 툴팁 및 드릴다운
 * - 확대/축소 및 데이터 내보내기
 */
const BubbleChartVisualization = ({
  data = [],
  loading = false,
  filters = {},
  onBubbleClick
}) => {
  const [chartConfig, setChartConfig] = useState({
    colorScheme: 'category20',
    showLabels: false,
    animation: true
  });
  
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [chartError, setChartError] = useState(null);

  // 차트별 독립 기준점 설정
  const getChartSpecificThresholds = () => {
    // 실제 데이터 분석을 통해 차트 타입 감지
    const isThemeChart = data.some(item => item.type === 'theme');
    const isMechanismChart = data.some(item => item.type === 'mechanism');
    
    console.log('🔍 차트 타입 감지:', {
      dataLength: data.length,
      isThemeChart,
      isMechanismChart,
      dataTypes: data.map(item => item.type).filter(Boolean)
    });
    
    if (isThemeChart) {
      // 카테고리/테마 차트: 기존 기준점 유지
      console.log('📊 카테고리 차트 기준점 적용: 7.0 / 2.25');
      return {
        ratingThreshold: 7.0,
        complexityThreshold: 2.25,
        chartType: 'categories'
      };
    } else {
      // 메커니즘 차트: 조정된 기준점
      console.log('🔧 메커니즘 차트 기준점 적용: 7.15 / 2.45');
      return {
        ratingThreshold: 7.15,
        complexityThreshold: 2.45,
        chartType: 'mechanics'
      };
    }
  };

  const getFixedQuadrantSettings = () => {
    const thresholds = getChartSpecificThresholds();
    
    console.log('📊 차트별 기준점:', { 
      chartType: thresholds.chartType,
      ratingThreshold: thresholds.ratingThreshold, 
      complexityThreshold: thresholds.complexityThreshold 
    });
    console.log('📍 실제 데이터 좌표들:', data.map(d => ({ name: d.group, x: d.x, y: d.y })));

    return {
      centerX: 50, // 항상 50% (고정)
      centerY: 50, // 항상 50% (고정)
      ratingThreshold: thresholds.ratingThreshold,
      complexityThreshold: thresholds.complexityThreshold,
      chartType: thresholds.chartType
    };
  };

  const quadrantSettings = getFixedQuadrantSettings();
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);

  // 데이터 전처리 및 검증
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.warn('버블차트: 잘못된 데이터 형식', data);
      return [];
    }

    const processedData = data
      .filter(item => {
        // 필수 필드 검증
        if (!item || typeof item.x !== 'number' || typeof item.y !== 'number' || !item.size) {
          console.warn('버블차트: 필수 필드 누락', item);
          return false;
        }

        // 유효한 값 범위 검증
        if (item.x < 0 || item.x > 10 || item.y < 0 || item.y > 5 || item.size <= 0) {
          console.warn('버블차트: 값 범위 초과', item);
          return false;
        }

        return true;
      })
      .map((item, index) => ({
        ...item, // 원본 데이터의 모든 필드 유지
        group: item.group || `그룹 ${index + 1}`,
        x: Number(item.x.toFixed(2)),
        y: Number(item.y.toFixed(2)),
        size: Math.max(item.size, 1), // 최소 크기 보장
        games: item.games || [],
        statistics: item.statistics || {},
        // 추가 메타데이터
        id: `bubble-${index}`,
        color: item.color || undefined
      }));

    // 데이터 범위 확인
    if (processedData.length > 0) {
      const xValues = processedData.map(item => item.x);
      const yValues = processedData.map(item => item.y);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);
      
      console.log('📊 실제 데이터 범위:');
      console.log(`X축 (평점): ${xMin} ~ ${xMax}`);
      console.log(`Y축 (난이도): ${yMin} ~ ${yMax}`);
      console.log('📊 전체 데이터:', processedData);
    }

    return processedData;
  }, [data]);

  // 차트 설정
  const config = useMemo(() => {
    if (chartData.length === 0) return null;

    return {
      data: chartData,
      xField: 'x',
      yField: 'y',
      sizeField: 'size',
      colorField: 'group',
      size: [20, 120], // 버블 크기 범위 (더 크게 조정)
      shape: 'circle',
      
      // 차트 크기 설정 - 오버레이와 무관하게 전체 영역 사용
      width: undefined, // 부모 컨테이너 크기에 맞춤
      height: undefined, // 부모 컨테이너 크기에 맞춤
      autoFit: true, // 자동으로 컨테이너에 맞춤
      
      // 축 설정 - 실제 데이터 범위에 맞춘 고정 범위
      xAxis: {
        title: {
          text: '평균 평점',
          style: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        type: 'linear',
        min: 6.0,
        max: 8.0,
        nice: false, // 자동 조정 비활성화
        minLimit: 6.0, // 최소값 강제 고정
        maxLimit: 8.0, // 최대값 강제 고정
        range: [0, 1], // 전체 범위 사용
        tickCount: 5, // 6.0, 6.5, 7.0, 7.5, 8.0
        tickInterval: 0.5, // 0.5씩 증가
        grid: {
          line: {
            style: {
              stroke: '#f0f0f0',
              lineWidth: 1,
            },
          },
        },
      },
      yAxis: {
        title: {
          text: '평균 난이도',
          style: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        type: 'linear',
        min: 1.0,
        max: 3.5,
        nice: false, // 자동 조정 비활성화
        minLimit: 1.0, // 최소값 강제 고정
        maxLimit: 3.5, // 최대값 강제 고정
        range: [0, 1], // 전체 범위 사용
        tickCount: 6, // 1.0, 1.5, 2.0, 2.5, 3.0, 3.5
        tickInterval: 0.5, // 0.5씩 증가
        grid: {
          line: {
            style: {
              stroke: '#f0f0f0',
              lineWidth: 1,
            },
          },
        },
      },


      // 색상 테마 - 실제 데이터에 맞춰 동적 생성
      color: (() => {
        const baseColors = [
          '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
          '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb'
        ];
        const uniqueGroups = [...new Set(chartData.map(item => item.group))];
        return baseColors.slice(0, uniqueGroups.length);
      })(),

      // 범례 - 실제 데이터 그룹만 표시
      legend: {
        position: 'bottom',
        flipPage: false,
        marker: {
          symbol: 'circle'
        },
        // 실제 데이터에 있는 그룹만 범례에 표시
        selected: (() => {
          const selected = {};
          const uniqueGroups = [...new Set(chartData.map(item => item.group))];
          uniqueGroups.forEach(group => {
            selected[group] = true;
          });
          return selected;
        })()
      },

      // 애니메이션
      animation: chartConfig.animation ? {
        appear: {
          animation: 'zoom-in',
          duration: 800,
        },
      } : false,

      // 툴팁
      tooltip: {
        showTitle: false,
        formatter: (datum) => {
          const gamesText = datum.games && datum.games.length > 0 
            ? `대표 게임: ${datum.games.slice(0, 3).map(g => g.name || g).join(', ')}${datum.games.length > 3 ? '...' : ''}`
            : '게임 정보 없음';
          
          return {
            name: datum.group,
            value: `평점: ${datum.x} | 난이도: ${datum.y} | 게임수: ${datum.size}개\n${gamesText}`
          };
        },
        customContent: (title, data) => {
          if (!data || data.length === 0) return null;
          
          const item = data[0]?.data;
          if (!item) return null;

          return `
            <div class="bubble-chart-tooltip">
              <div class="tooltip-header">
                <strong>${item.group}</strong>
              </div>
              <div class="tooltip-body">
                <div>평균 평점: <strong>${item.x}</strong></div>
                <div>평균 난이도: <strong>${item.y}</strong></div>
                <div>게임 수: <strong>${item.size}개</strong></div>
                ${item.games && item.games.length > 0 ? `
                  <div class="tooltip-games">
                    <div>대표 게임:</div>
                    <ul>
                      ${item.games.slice(0, 3).map(game => `
                        <li>${game.name || game}</li>
                      `).join('')}
                      ${item.games.length > 3 ? '<li>...</li>' : ''}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }
      },

      // 인터랙션
      interactions: [
        {
          type: 'element-active',
        },
        {
          type: 'brush-x',
          enable: false
        }
      ],

      // 클릭 이벤트 핸들러 - onElementClick 방식 사용
      onElementClick: (evt, data) => {
        console.log('🎯 onElementClick 이벤트:', evt);
        console.log('🎯 클릭된 데이터:', data);
        if (data) {
          setSelectedBubble(data);
          if (onBubbleClick) {
            console.log('🎯 외부 핸들러 호출:', data);
            onBubbleClick(data);
          }
        }
      },
      
      // 이벤트 핸들러
      onReady: (plot) => {
        console.log('✅ 버블차트 렌더링 완료');
        console.log('📊 차트 데이터 확인:', chartData);
      }
    };
  }, [chartData, chartConfig, onBubbleClick]);

  // 차트 설정 변경 핸들러
  const handleConfigChange = (key, value) => {
    setChartConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 4사분면 분석 함수
  const analyzeQuadrant = (avgRating, avgComplexity) => {
    const ratingThreshold = quadrantSettings.ratingThreshold; // 차트별 평점 기준점
    const complexityThreshold = quadrantSettings.complexityThreshold; // 차트별 난이도 기준점
    
    if (avgRating >= ratingThreshold && avgComplexity >= complexityThreshold) {
      return {
        quadrant: 'top-right',
        name: '🔥 고위험 고수익',
        title: '고평점 · 고난이도 영역',
        description: '높은 평점을 받지만 난이도가 높은 영역입니다. 숙련된 게이머들이 선호하며, 깊이 있는 게임 경험을 제공합니다.',
        marketInsight: '전문 게이머 타겟, 프리미엄 시장',
        strategy: '복잡하지만 보상이 큰 게임 메카닉을 활용하세요',
        riskLevel: 'high',
        color: '#722ed1'
      };
    } else if (avgRating < ratingThreshold && avgComplexity >= complexityThreshold) {
      return {
        quadrant: 'top-left',
        name: '⚠️ 위험 영역',
        title: '저평점 · 고난이도 영역',
        description: '높은 난이도에 비해 평점이 낮은 영역입니다. 게임 디자인의 균형이 맞지 않거나 타겟 오디언스가 제한적일 수 있습니다.',
        marketInsight: '경쟁이 치열하거나 니치 마켓',
        strategy: '게임성 개선이나 난이도 조정이 필요합니다',
        riskLevel: 'very-high',
        color: '#f5222d'
      };
    } else if (avgRating >= ratingThreshold && avgComplexity < complexityThreshold) {
      return {
        quadrant: 'bottom-right',
        name: '✨ 대중적 성공',
        title: '고평점 · 저난이도 영역',
        description: '높은 평점과 적당한 난이도를 가진 대중적인 영역입니다. 접근성이 좋으면서도 재미있는 게임들이 위치합니다.',
        marketInsight: '대중적 어필, 안정적 수요',
        strategy: '검증된 성공 공식을 활용하세요',
        riskLevel: 'low',
        color: '#52c41a'
      };
    } else {
      return {
        quadrant: 'bottom-left',
        name: '🎯 진입 기회',
        title: '저평점 · 저난이도 영역',
        description: '상대적으로 경쟁이 적고 진입 장벽이 낮은 영역입니다. 혁신적인 아이디어로 블루오션을 만들 수 있는 기회가 있습니다.',
        marketInsight: '블루오션 가능성, 혁신 기회',
        strategy: '차별화된 접근으로 새로운 가치를 창출하세요',
        riskLevel: 'medium',
        color: '#faad14'
      };
    }
  };

  // 4사분면 클릭 핸들러
  const handleQuadrantClick = (quadrantType) => {
    console.log('🎯 사분면 클릭:', quadrantType);
    
    // 차트별 동적 기준점 사용
    const ratingThreshold = quadrantSettings.ratingThreshold;
    const complexityThreshold = quadrantSettings.complexityThreshold;
    
    console.log('📊 사용된 기준점:', { 
      chartType: quadrantSettings.chartType,
      ratingThreshold, 
      complexityThreshold 
    });
    
    // 클릭된 사분면에 해당하는 데이터 필터링
    const quadrantData = chartData.filter(item => {
      const avgRating = item.x;
      const avgComplexity = item.y;
      
      switch(quadrantType) {
        case 'top-right':
          return avgRating >= ratingThreshold && avgComplexity >= complexityThreshold;
        case 'top-left':
          return avgRating < ratingThreshold && avgComplexity >= complexityThreshold;
        case 'bottom-right':
          return avgRating >= ratingThreshold && avgComplexity < complexityThreshold;
        case 'bottom-left':
          return avgRating < ratingThreshold && avgComplexity < complexityThreshold;
        default:
          return false;
      }
    });
    
    if (quadrantData.length > 0) {
      // 영역의 평균값으로 사분면 분석 (더 정확한 분석)
      const avgRating = quadrantData.reduce((sum, item) => sum + item.x, 0) / quadrantData.length;
      const avgComplexity = quadrantData.reduce((sum, item) => sum + item.y, 0) / quadrantData.length;
      
      console.log(`🔍 ${quadrantType} 영역 분석:`, {
        clickedQuadrant: quadrantType,
        filteredItems: quadrantData.map(d => ({ name: d.group, x: d.x, y: d.y })),
        avgRating: avgRating.toFixed(2),
        avgComplexity: avgComplexity.toFixed(2),
        thresholds: { ratingThreshold, complexityThreshold }
      });
      
      const quadrantAnalysis = analyzeQuadrant(avgRating, avgComplexity);
      
      console.log(`📊 ${quadrantType} 영역 최종 분석:`, quadrantAnalysis);
      
      setSelectedQuadrant({
        ...quadrantAnalysis,
        data: quadrantData,
        totalItems: quadrantData.length,
        avgStats: {
          avgRating: avgRating.toFixed(2),
          avgComplexity: avgComplexity.toFixed(2),
          totalGames: quadrantData.reduce((sum, item) => sum + item.size, 0)
        }
      });
    } else {
      // 데이터가 없는 경우에도 분석 정보 표시
      const quadrantAnalysis = analyzeQuadrant(
        quadrantType.includes('right') ? 8.0 : 6.0,
        quadrantType.includes('top') ? 3.0 : 2.0
      );
      
      setSelectedQuadrant({
        ...quadrantAnalysis,
        data: [],
        totalItems: 0,
        avgStats: {
          avgRating: '데이터 없음',
          avgComplexity: '데이터 없음',
          totalGames: 0
        }
      });
    }
  };

  // 데이터 내보내기
  const handleExport = () => {
    const exportData = chartData.map(item => ({
      그룹: item.group,
      평균평점: item.x,
      평균난이도: item.y,
      게임수: item.size,
      대표게임: item.games ? item.games.slice(0, 3).map(g => g.name || g).join(', ') : ''
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bubble-chart-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 에러 상태
  if (chartError) {
    return (
      <Alert
        message="차트 렌더링 오류"
        description={chartError}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => setChartError(null)}>
            다시 시도
          </Button>
        }
      />
    );
  }

  // 데이터 없음
  if (!loading && chartData.length === 0) {
    return (
      <div className="bubble-chart-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <Text>표시할 데이터가 없습니다</Text>
              <Text type="secondary">필터 조건을 조정해보세요</Text>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div className="bubble-chart-visualization">
      {/* 차트 컨트롤 */}
      <div className="chart-controls">
        <Space size="middle">
          <Space size="small">
            <Text>애니메이션:</Text>
            <Select
              size="small"
              value={chartConfig.animation}
              onChange={(value) => handleConfigChange('animation', value)}
              style={{ width: 80 }}
            >
              <Option value={true}>ON</Option>
              <Option value={false}>OFF</Option>
            </Select>
          </Space>

          <Tooltip title="데이터 내보내기">
            <Button 
              size="small" 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              disabled={loading || chartData.length === 0}
            >
              내보내기
            </Button>
          </Tooltip>

          <Tooltip title="현재 필터: 그룹화 기준">
            <Text type="secondary" className="filter-info">
              <InfoCircleOutlined /> {filters.groupBy === 'categories' ? '카테고리별' : '메카닉별'}
            </Text>
          </Tooltip>
        </Space>
      </div>

      {/* 차트 영역 */}
      <div className="chart-container">
        {loading ? (
          <div className="chart-loading">
            <Spin size="large" />
            <Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
              버블차트 데이터 로딩 중...
            </Text>
          </div>
        ) : config ? (
          <div className="chart-with-overlay">
            <div className="scatter-chart-wrapper" style={{ position: 'relative' }}>
              <Scatter {...config} />
              
              {/* 4사분면 클릭 영역 오버레이 */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
                {/* 오른쪽 상단 - 고위험 고수익 */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '5%',
                    right: '5%',
                    width: '45%',
                    height: '40%',
                    cursor: 'pointer',
                    // background: 'rgba(114, 46, 209, 0.1)', // 디버깅용 - 제거
                  }}
                  onClick={() => handleQuadrantClick('top-right')}
                />
                
                {/* 왼쪽 상단 - 위험 영역 */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '5%',
                    left: '5%',
                    width: '45%',
                    height: '40%',
                    cursor: 'pointer',
                    // background: 'rgba(245, 34, 45, 0.1)', // 디버깅용 - 제거
                  }}
                  onClick={() => handleQuadrantClick('top-left')}
                />
                
                {/* 오른쪽 하단 - 대중적 성공 */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '5%',
                    width: '45%',
                    height: '40%',
                    cursor: 'pointer',
                    // background: 'rgba(82, 196, 26, 0.1)', // 디버깅용 - 제거
                  }}
                  onClick={() => handleQuadrantClick('bottom-right')}
                />
                
                {/* 왼쪽 하단 - 진입 기회 */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '5%',
                    width: '45%',
                    height: '40%',
                    cursor: 'pointer',
                    // background: 'rgba(250, 173, 20, 0.1)', // 디버깅용 - 제거
                  }}
                  onClick={() => handleQuadrantClick('bottom-left')}
                />
              </div>
            </div>
            
            {/* 차트 위 4분면 오버레이 - 고정된 크기 (50%씩 4등분) */}
            <div className="quadrant-overlay">
              {/* 오른쪽 상단 - 고위험 고수익 */}
              <div 
                className="overlay-quadrant"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  width: '50%',
                  height: '50%',
                  background: 'linear-gradient(135deg, rgba(114, 46, 209, 0.08) 0%, rgba(114, 46, 209, 0.02) 100%)',
                  border: '2px solid rgba(114, 46, 209, 0.15)',
                  borderLeft: '1px dashed rgba(114, 46, 209, 0.3)',
                  borderBottom: '1px dashed rgba(114, 46, 209, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleQuadrantClick('top-right')}
              >
                <div className="overlay-label">
                  <Text strong style={{ color: '#722ed1', fontSize: '11px' }}>
                    🔥 고위험 고수익
                  </Text>
                  <Text type="secondary" style={{ fontSize: '9px', lineHeight: 1.2 }}>
                    평점 {quadrantSettings.ratingThreshold}+ / 난이도 {quadrantSettings.complexityThreshold}+<br />레드오션 vs 숨겨진 보석
                  </Text>
                </div>
              </div>
              
              {/* 왼쪽 상단 - 위험 영역 */}
              <div 
                className="overlay-quadrant"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '50%',
                  background: 'linear-gradient(135deg, rgba(245, 34, 45, 0.08) 0%, rgba(245, 34, 45, 0.02) 100%)',
                  border: '2px solid rgba(245, 34, 45, 0.15)',
                  borderRight: '1px dashed rgba(245, 34, 45, 0.3)',
                  borderBottom: '1px dashed rgba(245, 34, 45, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleQuadrantClick('top-left')}
              >
                <div className="overlay-label">
                  <Text strong style={{ color: '#f5222d', fontSize: '11px' }}>
                    ⚠️ 위험 영역
                  </Text>
                  <Text type="secondary" style={{ fontSize: '9px', lineHeight: 1.2 }}>
                    평점 {quadrantSettings.ratingThreshold}- / 난이도 {quadrantSettings.complexityThreshold}+<br />피해야 할 조합
                  </Text>
                </div>
              </div>
              
              {/* 오른쪽 하단 - 대중적 성공 */}
              <div 
                className="overlay-quadrant"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: '50%',
                  height: '50%',
                  background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%)',
                  border: '2px solid rgba(82, 196, 26, 0.15)',
                  borderLeft: '1px dashed rgba(82, 196, 26, 0.3)',
                  borderTop: '1px dashed rgba(82, 196, 26, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleQuadrantClick('bottom-right')}
              >
                <div className="overlay-label">
                  <Text strong style={{ color: '#52c41a', fontSize: '11px' }}>
                    ✨ 대중적 성공
                  </Text>
                  <Text type="secondary" style={{ fontSize: '9px', lineHeight: 1.2 }}>
                    평점 {quadrantSettings.ratingThreshold}+ / 난이도 {quadrantSettings.complexityThreshold}-<br />꿀조합 베스트셀러
                  </Text>
                </div>
              </div>
              
              {/* 왼쪽 하단 - 진입 기회 */}
              <div 
                className="overlay-quadrant"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '50%',
                  height: '50%',
                  background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.08) 0%, rgba(250, 173, 20, 0.02) 100%)',
                  border: '2px solid rgba(250, 173, 20, 0.15)',
                  borderRight: '1px dashed rgba(250, 173, 20, 0.3)',
                  borderTop: '1px dashed rgba(250, 173, 20, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleQuadrantClick('bottom-left')}
              >
                <div className="overlay-label">
                  <Text strong style={{ color: '#faad14', fontSize: '11px' }}>
                    🎯 진입 기회
                  </Text>
                  <Text type="secondary" style={{ fontSize: '9px', lineHeight: 1.2 }}>
                    평점 {quadrantSettings.ratingThreshold}- / 난이도 {quadrantSettings.complexityThreshold}-<br />혁신 기회 영역
                  </Text>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="chart-error">
            <Text type="secondary">차트를 그릴 수 없습니다</Text>
          </div>
        )}
      </div>

      {/* 선택된 버블 정보 */}
      {selectedBubble && (
        <Card 
          size="small" 
          className="selected-bubble-info"
          title={`선택된 그룹: ${selectedBubble.group}`}
          extra={
            <Button 
              size="small" 
              type="text"
              onClick={() => setSelectedBubble(null)}
            >
              ×
            </Button>
          }
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text>평균 평점: <strong>{selectedBubble.x}</strong></Text>
            <Text>평균 난이도: <strong>{selectedBubble.y}</strong></Text>
            <Text>게임 수: <strong>{selectedBubble.size}개</strong></Text>
            
            {selectedBubble.games && selectedBubble.games.length > 0 && (
              <div>
                <Text type="secondary">대표 게임:</Text>
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  {selectedBubble.games.slice(0, 5).map((game, index) => (
                    <li key={index}>
                      <Text>{game.name || game}</Text>
                    </li>
                  ))}
                  {selectedBubble.games.length > 5 && (
                    <li><Text type="secondary">... 외 {selectedBubble.games.length - 5}개</Text></li>
                  )}
                </ul>
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* 4사분면 분석 모달 */}
      <Modal
        title={
          <Space>
            <span style={{ color: selectedQuadrant?.color }}>{selectedQuadrant?.name}</span>
            <Tag color={selectedQuadrant?.riskLevel === 'low' ? 'green' : 
                       selectedQuadrant?.riskLevel === 'medium' ? 'orange' : 
                       selectedQuadrant?.riskLevel === 'high' ? 'purple' : 'red'}>
              {selectedQuadrant?.riskLevel === 'low' ? '저위험' : 
               selectedQuadrant?.riskLevel === 'medium' ? '중위험' : 
               selectedQuadrant?.riskLevel === 'high' ? '고위험' : '매우 고위험'}
            </Tag>
          </Space>
        }
        open={!!selectedQuadrant}
        onCancel={() => setSelectedQuadrant(null)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setSelectedQuadrant(null)}>
            닫기
          </Button>
        ]}
      >
        {selectedQuadrant && (
          <div>
            {/* 사분면 개요 */}
            <Card size="small" style={{ marginBottom: 16, background: selectedQuadrant.color + '10' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Title level={5} style={{ margin: 0, color: selectedQuadrant.color }}>
                  {selectedQuadrant.title}
                </Typography.Title>
                <Typography.Paragraph style={{ margin: 0 }}>
                  {selectedQuadrant.description}
                </Typography.Paragraph>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text><strong>🎯 시장 인사이트:</strong> {selectedQuadrant.marketInsight}</Text>
                  <Text><strong>📈 권장 전략:</strong> {selectedQuadrant.strategy}</Text>
                </Space>
              </Space>
            </Card>

            {/* 통계 요약 */}
            <Card size="small" title="📊 영역 통계" style={{ marginBottom: 16 }}>
              <Space wrap size="large">
                <div>
                  <Text type="secondary">항목 수</Text>
                  <div><Text strong style={{ fontSize: 16 }}>{selectedQuadrant.totalItems}개</Text></div>
                </div>
                <div>
                  <Text type="secondary">평균 평점</Text>
                  <div><Text strong style={{ fontSize: 16 }}>{selectedQuadrant.avgStats.avgRating}</Text></div>
                </div>
                <div>
                  <Text type="secondary">평균 난이도</Text>
                  <div><Text strong style={{ fontSize: 16 }}>{selectedQuadrant.avgStats.avgComplexity}</Text></div>
                </div>
                <div>
                  <Text type="secondary">총 게임 수</Text>
                  <div><Text strong style={{ fontSize: 16 }}>{selectedQuadrant.avgStats.totalGames}개</Text></div>
                </div>
              </Space>
            </Card>

            {/* 상세 데이터 테이블 */}
            {selectedQuadrant.data && selectedQuadrant.data.length > 0 ? (
              <Card size="small" title="📋 상세 데이터">
                <Table
                  dataSource={selectedQuadrant.data}
                  columns={[
                    {
                      title: '그룹',
                      dataIndex: 'group',
                      key: 'group',
                      width: 120,
                      render: (text) => <Text strong>{text}</Text>
                    },
                    {
                      title: '평균 평점',
                      dataIndex: 'x',
                      key: 'rating',
                      width: 80,
                      render: (value) => <Text>{value}</Text>,
                      sorter: (a, b) => a.x - b.x
                    },
                    {
                      title: '평균 난이도',
                      dataIndex: 'y',
                      key: 'complexity',
                      width: 80,
                      render: (value) => <Text>{value}</Text>,
                      sorter: (a, b) => a.y - b.y
                    },
                    {
                      title: '게임 수',
                      dataIndex: 'size',
                      key: 'size',
                      width: 80,
                      render: (value) => <Text>{value}개</Text>,
                      sorter: (a, b) => a.size - b.size
                    },
                    {
                      title: '대표 게임',
                      key: 'games',
                      render: (record) => {
                        if (!record.games || record.games.length === 0) {
                          return <Text type="secondary">정보 없음</Text>;
                        }
                        return (
                          <div>
                            {record.games.slice(0, 2).map((game, index) => (
                              <div key={index}>
                                <Text style={{ fontSize: 12 }}>{game.name || game}</Text>
                              </div>
                            ))}
                            {record.games.length > 2 && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                +{record.games.length - 2}개 더
                              </Text>
                            )}
                          </div>
                        );
                      }
                    }
                  ]}
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                    showTotal: (total) => `총 ${total}개 항목`
                  }}
                  size="small"
                  rowKey="id"
                />
              </Card>
            ) : (
              <Card size="small" title="📋 상세 데이터">
                <Empty 
                  description="이 영역에는 현재 데이터가 없습니다"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* 간단한 사용 가이드 */}
      <div className="simple-guide">
        <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
          💡 <strong>버블 크기:</strong> 게임 수 (시장 규모) | 
          <strong>X축:</strong> 평균 평점 | <strong>Y축:</strong> 평균 난이도 | 
          <strong>클릭:</strong> 4사분면 영역을 클릭하여 상세 분석 확인
        </Text>
      </div>
    </div>
  );
};

export default BubbleChartVisualization;