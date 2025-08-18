import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllDevelopers, assignDeveloper } from '../api/apiClient.js';

const AssignDeveloperPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [developers, setDevelopers] = useState([]);
    const [selectedDeveloper, setSelectedDeveloper] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDevelopers = async () => {
            try {
                const data = await getAllDevelopers();
                setDevelopers(data);
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || '데이터 조회 실패';
                setError(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDevelopers();
    }, []);

    const handleAssign = async () => {
        if (!selectedDeveloper) {
            alert('배정할 개발자를 선택해주세요.');
            return;
        }
        if (!window.confirm('선택한 개발자를 프로젝트에 배정하시겠습니까?')) return;

        try {
            const message = await assignDeveloper(projectId, selectedDeveloper);
            alert(message || '개발자가 성공적으로 배정되었습니다.');
            navigate('/'); // 배정 완료 후 메인 페이지나 프로젝트 대시보드로 이동
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || '배정 실패';
            alert(`배정 실패: ${errorMsg}`);
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>개발자 목록을 불러오는 중...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>오류: {error}</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
            <h1>개발자 배정</h1>
            <h2>프로젝트 ID: {projectId}</h2>
            <div style={{ marginTop: '2rem' }}>
                <select 
                    value={selectedDeveloper} 
                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                    style={{ padding: '0.8rem', fontSize: '1rem', minWidth: '300px', borderRadius: '6px' }}
                >
                    <option value="">-- 개발자 선택 --</option>
                    {developers.map(dev => (
                        <option key={dev.userId} value={dev.userId}>
                            {dev.name} ({dev.email})
                        </option>
                    ))}
                </select>
                <button 
                    onClick={handleAssign}
                    disabled={!selectedDeveloper}
                    style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', marginLeft: '1rem', borderRadius: '6px', cursor: 'pointer', border: 'none', color: 'white', backgroundColor: '#4c51bf' }}
                >
                    배정하기
                </button>
            </div>
        </div>
    );
};

export default AssignDeveloperPage;