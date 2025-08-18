import React, { useState, useEffect, useMemo } from 'react';
import { Heatmap } from '@ant-design/plots';
import { Card, Spin, Empty, Alert, Space, Typography, Tooltip, Button, Select, Radio } from 'antd';
import { 
  HeatMapOutlined, 
  InfoCircleOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';

import './HeatmapVisualization.css';

const { Text, Title } = Typography;
const { Option } = Select;

/**
 * 히트맵 시각화 컴포넌트
 * 
 * 기능:
 * - X축: 플레이어 수, Y축: 난이도 구간, 값: 게임 수
 * - 색상 강도로 데이터 밀도 표현
 * - 인터랙티브 툴팁 및 셀 선택
 * - 다양한 색상 테마 및 시각화 옵션
 */
const HeatmapVisualization = ({
  data = [],
  loading = false,
  filters = {}
}) => {
  const [heatmapConfig, setHeatmapConfig] = useState({
    colorScheme: 'blues',
    showValues: true,
    showAxis: true,
    cellSize: 'auto'
  });
  
  const [selectedCell, setSelectedCell] = useState(null);
  const [chartError, setChartError] = useState(null);

  // 색상 테마 옵션
  const colorSchemes = [
    { value: 'blues', label: '블루', colors: ['#f7fbff', '#08519c'] },
    { value: 'reds', label: '레드', colors: ['#fff5f0', '#a50f15'] },
    { value: 'greens', label: '그린', colors: ['#f7fcf5', '#00441b'] },
    { value: 'oranges', label: '오렌지', colors: ['#fff5eb', '#a63603'] },
    { value: 'purples', label: '퍼플', colors: ['#fcfbfd', '#3f007d'] }
  ];

  // 데이터 전처리 및 검증
  const heatmapData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.warn('히트맵: 잘못된 데이터 형식', data);
      return [];
    }

    const validData = data.filter(item => {
      // 필수 필드 검증
      if (!item || !item.x || !item.y || typeof item.value !== 'number') {
        console.warn('히트맵: 필수 필드 누락', item);
        return false;
      }

      // 유효한 값 검증
      if (item.value < 0) {
        console.warn('히트맵: 음수 값', item);
        return false;
      }

      return true;
    });

    return validData.map((item, index) => ({
      x: String(item.x), // 문자열로 변환 (카테고리 축)
      y: String(item.y), // 문자열로 변환 (카테고리 축)
      value: Number(item.value),
      percentage: item.percentage || 0,
      description: item.description || '',
      intensity: item.intensity || (item.value / Math.max(...validData.map(d => d.value))),
      id: `cell-${index}`
    }));
  }, [data]);

  // 통계 정보 계산
  const statistics = useMemo(() => {
    if (heatmapData.length === 0) return null;

    const values = heatmapData.map(d => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = total / values.length;

    return {
      total,
      max,
      min,
      avg: Math.round(avg * 10) / 10,
      cells: heatmapData.length
    };
  }, [heatmapData]);

  // 색상 스케일 생성
  const getColorScale = (scheme) => {
    const schemes = {
      blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
      reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
      greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
      oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
      purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d']
    };
    
    return schemes[scheme] || schemes.blues;
  };

  // 차트 설정
  const config = useMemo(() => {
    if (heatmapData.length === 0) return null;

    const colorScale = getColorScale(heatmapConfig.colorScheme);

    return {
      data: heatmapData,
      xField: 'x',
      yField: 'y',
      colorField: 'value',
      
      // 색상 설정
      color: colorScale,
      
      // 셀 스타일
      rect: {
        style: {
          stroke: '#fff',
          strokeWidth: 1,
        },
      },

      // 축 설정
      xAxis: {
        title: {
          text: '플레이어 수',
          style: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        label: {
          style: {
            fontSize: 12,
          }
        }
      },
      yAxis: {
        title: {
          text: '난이도 구간',
          style: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        label: {
          style: {
            fontSize: 12,
          }
        }
      },

      // 범례
      legend: {
        position: 'right',
        title: {
          text: '게임 수',
          style: {
            fontSize: 12,
          }
        }
      },

      // 애니메이션
      animation: {
        appear: {
          animation: 'fade-in',
          duration: 800,
        },
      },

      // 셀 내 텍스트 표시
      label: heatmapConfig.showValues ? {
        style: {
          fontSize: 11,
          fontWeight: 'bold',
          fill: (datum) => {
            // 배경 색상에 따라 텍스트 색상 결정
            const intensity = datum.intensity || 0;
            return intensity > 0.5 ? '#fff' : '#000';
          }
        },
        formatter: (datum) => datum.value > 0 ? String(datum.value) : ''
      } : false,

      // 툴팁
      tooltip: {
        showTitle: false,
        customContent: (title, data) => {
          if (!data || data.length === 0) return null;
          
          const item = data[0]?.data;
          if (!item) return null;

          return `
            <div class="heatmap-tooltip">
              <div class="tooltip-header">
                <strong>${item.x} × ${item.y}</strong>
              </div>
              <div class="tooltip-body">
                <div>게임 수: <strong>${item.value}개</strong></div>
                ${item.percentage > 0 ? `<div>비율: <strong>${item.percentage.toFixed(1)}%</strong></div>` : ''}
                ${item.description ? `<div class="tooltip-desc">${item.description}</div>` : ''}
              </div>
            </div>
          `;
        }
      },

      // 인터랙션
      interactions: [
        {
          type: 'element-active',
        }
      ],

      // 이벤트 핸들러
      onReady: (plot) => {
        console.log('✅ 히트맵 렌더링 완료');
        
        // 셀 클릭 이벤트
        plot.on('element:click', (evt) => {
          const data = evt.data?.data;
          if (data) {
            console.log('🎯 히트맵 셀 클릭:', data);
            setSelectedCell(data);
          }
        });
      }
    };
  }, [heatmapData, heatmapConfig]);

  // 설정 변경 핸들러
  const handleConfigChange = (key, value) => {
    setHeatmapConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 데이터 내보내기
  const handleExport = () => {
    const exportData = heatmapData.map(item => ({
      플레이어수: item.x,
      난이도구간: item.y,
      게임수: item.value,
      비율: item.percentage ? `${item.percentage.toFixed(1)}%` : '',
      설명: item.description || ''
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `heatmap-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 에러 상태
  if (chartError) {
    return (
      <Alert
        message="히트맵 렌더링 오류"
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
  if (!loading && heatmapData.length === 0) {
    return (
      <div className="heatmap-empty">
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
    <div className="heatmap-visualization">
      {/* 차트 컨트롤 */}
      <div className="heatmap-controls">
        <Space size="middle" wrap>
          <Space size="small">
            <Text>색상 테마:</Text>
            <Select
              size="small"
              value={heatmapConfig.colorScheme}
              onChange={(value) => handleConfigChange('colorScheme', value)}
              style={{ width: 100 }}
            >
              {colorSchemes.map(scheme => (
                <Option key={scheme.value} value={scheme.value}>
                  {scheme.label}
                </Option>
              ))}
            </Select>
          </Space>

          <Space size="small">
            <Text>값 표시:</Text>
            <Radio.Group
              size="small"
              value={heatmapConfig.showValues}
              onChange={(e) => handleConfigChange('showValues', e.target.value)}
            >
              <Radio.Button value={true}>ON</Radio.Button>
              <Radio.Button value={false}>OFF</Radio.Button>
            </Radio.Group>
          </Space>

          <Tooltip title="데이터 내보내기">
            <Button 
              size="small" 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              disabled={loading || heatmapData.length === 0}
            >
              내보내기
            </Button>
          </Tooltip>
        </Space>

        {/* 통계 정보 */}
        {statistics && (
          <Space size="middle" className="heatmap-stats">
            <Text type="secondary">총 {statistics.total}개 게임</Text>
            <Text type="secondary">최대 {statistics.max}개</Text>
            <Text type="secondary">평균 {statistics.avg}개</Text>
            <Text type="secondary">{statistics.cells}개 셀</Text>
          </Space>
        )}
      </div>

      {/* 히트맵 영역 */}
      <div className="heatmap-container">
        {loading ? (
          <div className="heatmap-loading">
            <Spin size="large" />
            <Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
              히트맵 데이터 로딩 중...
            </Text>
          </div>
        ) : config ? (
          <Heatmap {...config} />
        ) : (
          <div className="heatmap-error">
            <Text type="secondary">히트맵을 그릴 수 없습니다</Text>
          </div>
        )}
      </div>

      {/* 선택된 셀 정보 */}
      {selectedCell && (
        <Card 
          size="small" 
          className="selected-cell-info"
          title={`선택된 셀: ${selectedCell.x} × ${selectedCell.y}`}
          extra={
            <Button 
              size="small" 
              type="text"
              onClick={() => setSelectedCell(null)}
            >
              ×
            </Button>
          }
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text>플레이어 수: <strong>{selectedCell.x}</strong></Text>
            <Text>난이도 구간: <strong>{selectedCell.y}</strong></Text>
            <Text>게임 수: <strong>{selectedCell.value}개</strong></Text>
            
            {selectedCell.percentage > 0 && (
              <Text>전체 비율: <strong>{selectedCell.percentage.toFixed(1)}%</strong></Text>
            )}
            
            {selectedCell.description && (
              <Text type="secondary">{selectedCell.description}</Text>
            )}
            
            <Text type="secondary" style={{ fontSize: '11px' }}>
              색상 강도: {(selectedCell.intensity * 100).toFixed(0)}%
            </Text>
          </Space>
        </Card>
      )}

      {/* 히트맵 설명 */}
      <div className="heatmap-description">
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 <strong>사용법:</strong> 각 셀은 해당 플레이어 수와 난이도 구간의 게임 밀도를 나타냅니다. 
          색이 진할수록 게임이 많습니다.
        </Text>
      </div>
    </div>
  );
};

export default HeatmapVisualization;