import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Form, 
  Slider, 
  Select, 
  Checkbox, 
  Button, 
  Space, 
  Divider, 
  Typography, 
  Tag,
  Collapse,
  InputNumber,
  Row,
  Col
} from 'antd';
import { 
  ClearOutlined, 
  SettingOutlined,
  CaretRightOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  ToolOutlined
} from '@ant-design/icons';

import './FilterControlPanel.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

/**
 * 통합 필터 컨트롤 패널 컴포넌트
 * 
 * 기능:
 * - 난이도 범위 슬라이더
 * - 플레이어 수 다중 선택
 * - 카테고리 검색 및 선택
 * - 메카닉 검색 및 선택
 * - 결과 개수 제한 설정
 * - 버블차트 그룹화 기준 선택
 */
const FilterControlPanel = ({
  categories = [],
  mechanics = [],
  filters = {},
  onFiltersChange,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [localFilters, setLocalFilters] = useState(filters);
  const debounceTimeoutRef = useRef(null);

  // 플레이어 수 옵션
  const playerOptions = [
    { label: '1인', value: 1 },
    { label: '2인', value: 2 },
    { label: '3인', value: 3 },
    { label: '4인', value: 4 },
    { label: '5인', value: 5 },
    { label: '6인', value: 6 },
    { label: '7인+', value: 7 }
  ];


  // props가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setLocalFilters(filters);
    form.setFieldsValue({
      complexity: [filters.complexityMin || 1.0, filters.complexityMax || 5.0],
      players: filters.players || [],
      categories: filters.categories || [],
      mechanics: filters.mechanics || []
    });
  }, [filters, form]);

  /**
   * 디바운스된 필터 변경 핸들러
   */
  const debouncedFilterChange = useCallback((newFilters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onFiltersChange?.(newFilters);
    }, 300); // 300ms 디바운싱
  }, [onFiltersChange]);

  /**
   * 필터 값 변경 핸들러
   */
  const handleFilterChange = (field, value, immediate = false) => {
    let newFilters = { ...localFilters };

    if (field === 'complexity') {
      newFilters.complexityMin = value[0];
      newFilters.complexityMax = value[1];
    } else {
      newFilters[field] = value;
    }

    setLocalFilters(newFilters);
    
    // 즉시 적용 또는 디바운싱 적용
    if (immediate) {
      onFiltersChange?.(newFilters);
    } else {
      debouncedFilterChange(newFilters);
    }
  };

  /**
   * 난이도 범위 수동 입력 핸들러
   */
  const handleComplexityInputChange = (type, value) => {
    if (value === null || value === undefined) return;
    
    const currentMin = localFilters.complexityMin || 1.0;
    const currentMax = localFilters.complexityMax || 5.0;
    
    let newMin = currentMin;
    let newMax = currentMax;
    
    if (type === 'min') {
      newMin = Math.min(Math.max(value, 1.0), currentMax - 0.1);
    } else {
      newMax = Math.max(Math.min(value, 5.0), currentMin + 0.1);
    }
    
    handleFilterChange('complexity', [newMin, newMax], true);
  };

  /**
   * 필터 초기화
   */
  const handleReset = () => {
    const defaultFilters = {
      complexityMin: 1.0,
      complexityMax: 5.0,
      players: [],
      categories: [],
      mechanics: []
    };

    setLocalFilters(defaultFilters);
    form.setFieldsValue({
      complexity: [1.0, 5.0],
      players: [],
      categories: [],
      mechanics: []
    });

    onFiltersChange?.(defaultFilters);
  };

  /**
   * 빠른 설정 적용
   */
  const applyQuickFilter = (preset) => {
    let quickFilters = { ...localFilters };

    switch (preset) {
      case 'popular':
        quickFilters = {
          ...quickFilters,
          complexityMin: 2.0,
          complexityMax: 4.0,
          players: [2, 3, 4]
        };
        break;
      case 'family':
        quickFilters = {
          ...quickFilters,
          complexityMin: 1.0,
          complexityMax: 3.0,
          players: [2, 3, 4, 5, 6],
          categories: categories.includes('Children\'s Game') ? ['Children\'s Game'] : []
        };
        break;
      case 'strategic':
        quickFilters = {
          ...quickFilters,
          complexityMin: 3.5,
          complexityMax: 5.0,
          players: [2, 3, 4]
        };
        break;
      case 'party':
        quickFilters = {
          ...quickFilters,
          complexityMin: 1.0,
          complexityMax: 2.5,
          players: [4, 5, 6, 7],
          categories: categories.includes('Party Game') ? ['Party Game'] : []
        };
        break;
      default:
        return;
    }

    setLocalFilters(quickFilters);
    form.setFieldsValue({
      complexity: [quickFilters.complexityMin, quickFilters.complexityMax],
      players: quickFilters.players,
      categories: quickFilters.categories || [],
      mechanics: quickFilters.mechanics || []
    });

    onFiltersChange?.(quickFilters);
  };

  return (
    <div className="filter-control-panel">
      {/* 현재 적용된 필터 - 맨 위로 이동 */}
      <div className="filter-status">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Text strong>현재 적용된 필터:</Text>
          
          {localFilters.players?.length > 0 && (
            <div>
              <Text type="secondary">플레이어: </Text>
              <Space size={4}>
                {localFilters.players.map(player => (
                  <Tag key={player} size="small" color="blue">
                    {player === 7 ? '7인+' : `${player}인`}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
          
          {localFilters.categories?.length > 0 && (
            <div>
              <Text type="secondary">카테고리: </Text>
              <Space size={4}>
                {localFilters.categories.slice(0, 3).map(category => (
                  <Tag key={category} size="small" color="green">
                    {category}
                  </Tag>
                ))}
                {localFilters.categories.length > 3 && (
                  <Tag size="small" color="default">
                    +{localFilters.categories.length - 3}개
                  </Tag>
                )}
              </Space>
            </div>
          )}
          
          {localFilters.mechanics?.length > 0 && (
            <div>
              <Text type="secondary">메카닉: </Text>
              <Space size={4}>
                {localFilters.mechanics.slice(0, 3).map(mechanic => (
                  <Tag key={mechanic} size="small" color="orange">
                    {mechanic}
                  </Tag>
                ))}
                {localFilters.mechanics.length > 3 && (
                  <Tag size="small" color="default">
                    +{localFilters.mechanics.length - 3}개
                  </Tag>
                )}
              </Space>
            </div>
          )}
        </Space>
        <Divider />
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        disabled={loading}
        className="filter-form"
      >
        {/* 빠른 설정 */}
        <div className="quick-filters">
          <Title level={5}>
            <ThunderboltOutlined /> 빠른 설정
          </Title>
          
          <Space size={[8, 8]} wrap>
            <Button 
              size="small" 
              onClick={() => applyQuickFilter('popular')}
              type="default"
            >
              인기 게임
            </Button>
            <Button 
              size="small" 
              onClick={() => applyQuickFilter('family')}
              type="default"
            >
              가족 게임
            </Button>
            <Button 
              size="small" 
              onClick={() => applyQuickFilter('strategic')}
              type="default"
            >
              전략 게임
            </Button>
            <Button 
              size="small" 
              onClick={() => applyQuickFilter('party')}
              type="default"
            >
              파티 게임
            </Button>
          </Space>
        </div>

        <Divider />

        {/* 기본 필터 */}
        <Collapse 
          defaultActiveKey={['basic']} 
          ghost
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        >
          <Panel header="기본 필터" key="basic">
            {/* 카테고리 선택 */}
            <Form.Item 
              label={
                <Space>
                  <AppstoreOutlined />
                  <span>카테고리</span>
                  <Text type="secondary">
                    (인기 {categories.length}개)
                  </Text>
                </Space>
              }
              name="categories"
            >
              <Select
                mode="multiple"
                placeholder="인기 카테고리에서 선택하세요"
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
                maxTagCount="responsive"
                onChange={(value) => handleFilterChange('categories', value, true)}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0', color: '#999', fontSize: '12px' }}>
                      🔥 게임 수 기준 상위 25개 인기 카테고리만 표시
                    </div>
                  </div>
                )}
              >
                {/* 인기 카테고리 25개만 표시 */}
                {categories
                  .filter(category => category && category.trim())
                  .map(category => (
                    <Option key={category} value={category}>
                      {category} 🔥
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            {/* 난이도 범위 */}
            <Form.Item 
              label={
                <Space>
                  <SettingOutlined />
                  <span>난이도 범위</span>
                </Space>
              }
              name="complexity"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* 수동 입력 */}
                <Row gutter={8} align="middle">
                  <Col span={10}>
                    <Space>
                      <Text type="secondary">최소:</Text>
                      <InputNumber
                        size="small"
                        min={1.0}
                        max={5.0}
                        step={0.1}
                        value={localFilters.complexityMin}
                        onChange={(value) => handleComplexityInputChange('min', value)}
                        formatter={value => `${value}`}
                        style={{ width: 60 }}
                      />
                    </Space>
                  </Col>
                  <Col span={10}>
                    <Space>
                      <Text type="secondary">최대:</Text>
                      <InputNumber
                        size="small"
                        min={1.0}
                        max={5.0}
                        step={0.1}
                        value={localFilters.complexityMax}
                        onChange={(value) => handleComplexityInputChange('max', value)}
                        formatter={value => `${value}`}
                        style={{ width: 60 }}
                      />
                    </Space>
                  </Col>
                  <Col span={4}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {localFilters.complexityMin?.toFixed(1)} ~ {localFilters.complexityMax?.toFixed(1)}
                    </Text>
                  </Col>
                </Row>
                
                {/* 슬라이더 */}
                <Slider
                  range
                  min={1.0}
                  max={5.0}
                  step={0.1}
                  value={[localFilters.complexityMin || 1.0, localFilters.complexityMax || 5.0]}
                  onChange={(value) => {
                    const newFilters = {
                      ...localFilters,
                      complexityMin: value[0],
                      complexityMax: value[1]
                    };
                    setLocalFilters(newFilters);
                  }}
                  onChangeComplete={(value) => {
                    handleFilterChange('complexity', value, true);
                  }}
                  tooltip={{
                    formatter: (value) => `${value?.toFixed(1)}`
                  }}
                  marks={{
                    1: '초급',
                    2: '쉬움',
                    3: '보통',
                    4: '어려움',
                    5: '전문가'
                  }}
                />
              </Space>
            </Form.Item>

            {/* 플레이어 수 */}
            <Form.Item 
              label={
                <Space>
                  <AppstoreOutlined />
                  플레이어 수
                </Space>
              }
              name="players"
            >
              <Checkbox.Group 
                options={playerOptions} 
                onChange={(value) => handleFilterChange('players', value, true)}
              />
            </Form.Item>
          </Panel>

          {/* 메카닉 선택 */}
          <Panel header="메카닉" key="advanced">
            <Form.Item 
              label={
                <Space>
                  <ToolOutlined />
                  <span>메카닉</span>
                  <Text type="secondary">
                    (인기 {mechanics.length}개)
                  </Text>
                </Space>
              }
              name="mechanics"
            >
              <Select
                mode="multiple"
                placeholder="인기 메카닉에서 선택하세요"
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
                maxTagCount="responsive"
                onChange={(value) => handleFilterChange('mechanics', value, true)}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0', color: '#999', fontSize: '12px' }}>
                      🔥 게임 수 기준 상위 30개 인기 메카닉만 표시
                    </div>
                  </div>
                )}
              >
                {/* 인기 메카닉 30개만 표시 */}
                {mechanics
                  .filter(mechanic => mechanic && mechanic.trim())
                  .map(mechanic => (
                    <Option key={mechanic} value={mechanic}>
                      {mechanic} 🔥
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Panel>
        </Collapse>


        {/* 액션 버튼 */}
        <div className="filter-actions">
          <Divider />
          
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleReset}
              disabled={loading}
              size="small"
            >
              초기화
            </Button>
            
            <Text type="secondary" style={{ fontSize: '12px' }}>
              실시간 업데이트
            </Text>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default FilterControlPanel;