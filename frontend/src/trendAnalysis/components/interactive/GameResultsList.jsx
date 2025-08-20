import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Input, 
  Select, 
  Rate, 
  Tooltip,
  Pagination,
  Empty,
  Alert,
  Dropdown,
  Menu
} from 'antd';
import { 
  FilterOutlined, 
  ExportOutlined,
  EyeOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  TrophyOutlined
} from '@ant-design/icons';

import './GameResultsList.css';

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

/**
 * 게임 결과 목록 컴포넌트
 * 
 * 기능:
 * - 필터링된 게임 목록 표시
 * - 테이블 형태의 상세 정보
 * - 검색, 정렬, 페이징 기능
 * - 게임별 상세 정보 모달
 * - 데이터 내보내기
 */
const GameResultsList = ({
  games = [],
  loading = false,
  filters = {}
}) => {
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState({
    field: 'averageRating',
    direction: 'descend'
  });
  const [pageConfig, setPageConfig] = useState({
    current: 1,
    pageSize: 20
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 검색 및 필터링된 데이터
  const filteredGames = useMemo(() => {
    if (!Array.isArray(games)) return [];
    
    let filtered = games.filter(game => {
      if (!game) return false;
      
      // 검색 필터
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const name = (game.name || '').toLowerCase();
        const categories = (game.categories || []).join(' ').toLowerCase();
        const mechanics = (game.mechanics || []).join(' ').toLowerCase();
        
        if (!name.includes(searchLower) && 
            !categories.includes(searchLower) && 
            !mechanics.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });

    // 정렬
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.field];
        let bVal = b[sortConfig.field];
        
        // 숫자 필드 처리
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'ascend' ? aVal - bVal : bVal - aVal;
        }
        
        // 문자열 필드 처리
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
        
        if (sortConfig.direction === 'ascend') {
          return aVal.localeCompare(bVal);
        } else {
          return bVal.localeCompare(aVal);
        }
      });
    }
    
    return filtered;
  }, [games, searchText, sortConfig]);

  // 페이징된 데이터
  const paginatedGames = useMemo(() => {
    const start = (pageConfig.current - 1) * pageConfig.pageSize;
    const end = start + pageConfig.pageSize;
    return filteredGames.slice(start, end);
  }, [filteredGames, pageConfig]);

  // 테이블 컬럼 정의
  const columns = [
    {
      title: '순위',
      dataIndex: 'bggRank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank) => rank ? (
        <Tooltip title={`BGG 랭킹 ${rank}위`}>
          <Tag color="gold" icon={<TrophyOutlined />}>
            #{rank}
          </Tag>
        </Tooltip>
      ) : (
        <Text type="secondary">-</Text>
      )
    },
    {
      title: '게임명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (name, record) => (
        <div className="game-name-cell">
          <Text strong>{name || '이름 없음'}</Text>
          {record.yearPublished && (
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              ({record.yearPublished})
            </Text>
          )}
        </div>
      )
    },
    {
      title: '평점',
      dataIndex: 'averageRating',
      key: 'rating',
      width: 120,
      align: 'center',
      sorter: true,
      render: (rating) => (
        <Space direction="vertical" size={2} style={{ textAlign: 'center' }}>
          <Rate 
            disabled 
            value={rating / 2} 
            allowHalf 
            style={{ fontSize: '14px' }}
          />
          <Text style={{ fontSize: '12px' }}>
            {rating ? rating.toFixed(1) : 'N/A'}
          </Text>
        </Space>
      )
    },
    {
      title: '난이도',
      dataIndex: 'averageWeight',
      key: 'weight',
      width: 100,
      align: 'center',
      sorter: true,
      render: (weight) => {
        if (!weight) return <Text type="secondary">N/A</Text>;
        
        const getWeightColor = (w) => {
          if (w <= 2) return 'green';
          if (w <= 3) return 'orange';
          if (w <= 4) return 'red';
          return 'purple';
        };
        
        const getWeightText = (w) => {
          if (w <= 2) return '쉬움';
          if (w <= 3) return '보통';
          if (w <= 4) return '어려움';
          return '전문가';
        };
        
        return (
          <Tooltip title={`난이도 ${weight.toFixed(1)}/5.0`}>
            <Tag color={getWeightColor(weight)}>
              {getWeightText(weight)}
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '플레이어',
      key: 'players',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ textAlign: 'center' }}>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <Text style={{ fontSize: '12px' }}>
            {record.minPlayers && record.maxPlayers 
              ? `${record.minPlayers}-${record.maxPlayers}인`
              : 'N/A'
            }
          </Text>
        </Space>
      )
    },
    {
      title: '시간',
      dataIndex: 'playingTime',
      key: 'time',
      width: 100,
      align: 'center',
      render: (time) => (
        <Space direction="vertical" size={2} style={{ textAlign: 'center' }}>
          <ClockCircleOutlined style={{ color: '#52c41a' }} />
          <Text style={{ fontSize: '12px' }}>
            {time ? `${time}분` : 'N/A'}
          </Text>
        </Space>
      )
    },
    {
      title: '카테고리',
      dataIndex: 'categories',
      key: 'categories',
      width: 150,
      ellipsis: true,
      render: (categories) => {
        if (!categories || categories.length === 0) {
          return <Text type="secondary">없음</Text>;
        }
        
        return (
          <Space size={4} wrap>
            {categories.slice(0, 2).map(category => (
              <Tag key={category} size="small" color="blue">
                {category}
              </Tag>
            ))}
            {categories.length > 2 && (
              <Tooltip title={categories.slice(2).join(', ')}>
                <Tag size="small" color="default">
                  +{categories.length - 2}
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: '메카닉',
      dataIndex: 'mechanics',
      key: 'mechanics',
      width: 150,
      ellipsis: true,
      render: (mechanics) => {
        if (!mechanics || mechanics.length === 0) {
          return <Text type="secondary">없음</Text>;
        }
        
        return (
          <Space size={4} wrap>
            {mechanics.slice(0, 2).map(mechanic => (
              <Tag key={mechanic} size="small" color="green">
                {mechanic}
              </Tag>
            ))}
            {mechanics.length > 2 && (
              <Tooltip title={mechanics.slice(2).join(', ')}>
                <Tag size="small" color="default">
                  +{mechanics.length - 2}
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: '액션',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />}>
                상세 보기
              </Menu.Item>
              <Menu.Item key="compare" icon={<FilterOutlined />}>
                비교하기
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button size="small" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // 테이블 설정
  const tableConfig = {
    columns,
    dataSource: paginatedGames,
    loading,
    pagination: false, // 커스텀 페이징 사용
    scroll: { x: 1200 },
    size: 'small',
    rowKey: 'gameId',
    rowSelection: {
      selectedRowKeys,
      onChange: setSelectedRowKeys,
      columnWidth: 50
    },
    onChange: (pagination, filters, sorter) => {
      if (sorter && sorter.field) {
        setSortConfig({
          field: sorter.field,
          direction: sorter.order
        });
      }
    }
  };

  // 검색 핸들러
  const handleSearch = (value) => {
    setSearchText(value);
    setPageConfig({ ...pageConfig, current: 1 });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page, pageSize) => {
    setPageConfig({ current: page, pageSize });
  };

  // 데이터 내보내기
  const handleExport = () => {
    const exportData = selectedRowKeys.length > 0 
      ? filteredGames.filter(game => selectedRowKeys.includes(game.gameId))
      : filteredGames;
    
    const csvData = exportData.map(game => ({
      게임명: game.name || '',
      평점: game.averageRating || '',
      난이도: game.averageWeight || '',
      최소플레이어: game.minPlayers || '',
      최대플레이어: game.maxPlayers || '',
      플레이시간: game.playingTime || '',
      출시년도: game.yearPublished || '',
      카테고리: (game.categories || []).join(', '),
      메카닉: (game.mechanics || []).join(', '),
      BGG순위: game.bggRank || ''
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `games-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 데이터 없음 상태
  if (!loading && filteredGames.length === 0) {
    return (
      <div className="games-list-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <Text>표시할 게임이 없습니다</Text>
              {searchText && (
                <Text type="secondary">
                  검색어 "{searchText}"에 대한 결과가 없습니다
                </Text>
              )}
              <Button onClick={() => setSearchText('')}>
                검색 초기화
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div className="game-results-list">
      {/* 컨트롤 영역 */}
      <div className="list-controls">
        <Space size="middle" wrap>
          <Search
            placeholder="게임명, 카테고리, 메카닉 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          
          <Select
            value={sortConfig.field}
            onChange={(field) => setSortConfig({ ...sortConfig, field })}
            style={{ width: 150 }}
          >
            <Option value="averageRating">평점순</Option>
            <Option value="averageWeight">난이도순</Option>
            <Option value="name">이름순</Option>
            <Option value="yearPublished">연도순</Option>
            <Option value="bggRank">랭킹순</Option>
          </Select>

          <Select
            value={sortConfig.direction}
            onChange={(direction) => setSortConfig({ ...sortConfig, direction })}
            style={{ width: 100 }}
          >
            <Option value="descend">내림차순</Option>
            <Option value="ascend">오름차순</Option>
          </Select>
        </Space>

        <Space>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">
              {selectedRowKeys.length}개 선택됨
            </Text>
          )}
          
          <Button 
            icon={<ExportOutlined />} 
            onClick={handleExport}
            disabled={loading || filteredGames.length === 0}
          >
            내보내기
          </Button>
        </Space>
      </div>

      {/* 필터 정보 */}
      {Object.keys(filters).some(key => filters[key]?.length > 0) && (
        <Alert
          message={
            <Space wrap>
              <Text>적용된 필터:</Text>
              {filters.players?.length > 0 && (
                <Tag color="blue">
                  플레이어: {filters.players.join(', ')}인
                </Tag>
              )}
              {filters.categories?.length > 0 && (
                <Tag color="green">
                  카테고리: {filters.categories.length}개
                </Tag>
              )}
              {filters.mechanics?.length > 0 && (
                <Tag color="orange">
                  메카닉: {filters.mechanics.length}개
                </Tag>
              )}
              <Tag color="purple">
                난이도: {filters.complexityMin}-{filters.complexityMax}
              </Tag>
            </Space>
          }
          type="info"
          showIcon={false}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 게임 테이블 */}
      <div className="games-table-container">
        <Table {...tableConfig} />
        
        {/* 커스텀 페이징 */}
        <div className="table-pagination">
          <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text type="secondary">
              총 {filteredGames.length}개 게임 중 {Math.min(pageConfig.pageSize, filteredGames.length)}개 표시
            </Text>
            
            <Pagination
              current={pageConfig.current}
              pageSize={pageConfig.pageSize}
              total={filteredGames.length}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} / ${total}개`
              }
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </Space>
        </div>
      </div>
    </div>
  );
};

export default GameResultsList;