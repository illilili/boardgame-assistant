// src/components/PlanManager.js

import React, { useState, useEffect } from 'react';
// API 함수를 import 합니다.
import { getMyProjects, getConceptsForSummary, getPlanDetail, savePlan, deletePlan } from '../api/auth.js';

function PlanManager() {
    // 프로젝트-컨셉-기획안을 연결하는 상태
    const [projectList, setProjectList] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');

    // 기획안 데이터
    const [planId, setPlanId] = useState('');
    const [planContent, setPlanContent] = useState('');
    const [plan, setPlan] = useState(null);
    const [message, setMessage] = useState('');

    // 로딩 및 에러 상태
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 프로젝트 목록 불러오기
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getMyProjects();
                setProjectList(data);
                if (data.length > 0) {
                    setSelectedProjectId(data[0].projectId.toString());
                }
            } catch (err) {
                console.error(err);
                setError('프로젝트 목록을 불러올 수 없습니다. 로그인이 유효한지 확인해주세요.');
            }
        };
        fetchProjects();
    }, []);

    // 모든 컨셉 목록 불러오기 (백엔드가 projectId로 필터링된 목록을 반환한다고 가정)
    useEffect(() => {
        const fetchAllConcepts = async () => {
            try {
                const data = await getConceptsForSummary();
                setConceptList(data);
            } catch (err) {
                setError(err.message || '컨셉 목록 로딩 실패');
            }
        };
        fetchAllConcepts();
    }, []);

    // 선택된 프로젝트에 따라 컨셉 목록을 필터링하는 useEffect
    useEffect(() => {
        if (!selectedProjectId || conceptList.length === 0) {
            setFilteredConceptList([]);
            setSelectedConceptId('');
            return;
        }

        const conceptsForProject = conceptList.filter(c => c.projectId === parseInt(selectedProjectId));
        setFilteredConceptList(conceptsForProject.sort((a, b) => b.conceptId - a.conceptId));
        if (conceptsForProject.length > 0) {
            setSelectedConceptId(conceptsForProject[0].conceptId.toString());
        } else {
            setSelectedConceptId('');
        }
    }, [selectedProjectId, conceptList]);

    // 💡 [수정된 부분] 선택된 컨셉이 바뀌면 자동으로 기획안 내용을 불러오도록 useEffect 추가
    useEffect(() => {
        if (selectedConceptId) {
            handleGetPlanDetail();
        } else {
            setPlanId('');
            setPlanContent('');
            setMessage('');
        }
    }, [selectedConceptId]);


    // 💡 기획안 상세 조회 함수
    const handleGetPlanDetail = async () => {
        if (!selectedConceptId) {
            setMessage('조회할 기획안 컨셉을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        try {
            // 컨셉 ID로 기획안 상세 조회 API 호출
            const planData = await getPlanDetail(selectedConceptId);
            setPlan(planData);
            setPlanId(planData.planId);
            setPlanContent(planData.currentContent);
            setMessage(`기획안 ID ${planData.planId}의 내용을 불러왔습니다.`);
        } catch (error) {
            setPlan(null);
            setPlanId('');
            setPlanContent('');
            setMessage(`조회 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 💡 기획안 저장 함수 (수정)
    const handleSavePlan = async () => {
        if (!selectedConceptId || !planContent) {
            setMessage('저장할 컨셉을 선택하고 내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const requestData = {
                planId: planId, // 기존 기획안이 있으면 ID 사용, 없으면 null
                conceptId: Number(selectedConceptId),
                planContent: planContent
            };
            const result = await savePlan(requestData);
            setMessage(`기획안이 성공적으로 저장되었습니다. (Plan ID: ${result.planId})`);
            // 저장 성공 후 planId와 내용을 업데이트하여 바로 편집 가능하도록 함
            setPlanId(result.planId);
            setPlanContent(result.planContent);
        } catch (error) {
            setMessage(`저장 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 💡 기획안 삭제 함수
    const handleDeletePlan = async () => {
        if (!planId) {
            setMessage('삭제할 기획안이 없습니다. 먼저 기획안을 조회해주세요.');
            return;
        }
        if (!window.confirm(`정말로 기획안 ID ${planId}를 삭제하시겠습니까?`)) {
            return;
        }
        setIsLoading(true);
        try {
            await deletePlan(planId);
            setPlan(null);
            setPlanId('');
            setPlanContent('');
            setMessage(`기획안 ID ${planId}가 성공적으로 삭제되었습니다.`);
        } catch (error) {
            setMessage(`삭제 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>기획안 관리</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* 프로젝트 및 컨셉 선택 드롭다운 */}
            <div className="form-group">
                <label htmlFor="project-select">프로젝트 선택</label>
                <select
                    id="project-select"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    required
                >
                    {projectList.length > 0 ? (
                        projectList.map((project) => (
                            <option key={project.projectId} value={project.projectId}>
                                {project.projectName}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>프로젝트를 먼저 생성해주세요.</option>
                    )}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="conceptId">컨셉 선택</label>
                <select
                    id="conceptId"
                    value={selectedConceptId}
                    onChange={(e) => setSelectedConceptId(e.target.value)}
                    required
                    disabled={filteredConceptList.length === 0 || isLoading}
                >
                    {filteredConceptList.length === 0 ? (
                        <option value="" disabled>-- 불러올 컨셉이 없습니다 --</option>
                    ) : (
                        <>
                            <option value="" disabled>-- 기획 컨셉을 선택하세요 --</option>
                            {filteredConceptList.map(concept => (
                                <option key={concept.conceptId} value={concept.conceptId}>
                                    ID: {concept.conceptId} - {concept.theme}
                                </option>
                            ))}
                        </>
                    )}
                </select>
            </div>

            <div>
                <button onClick={handleGetPlanDetail} disabled={isLoading || !selectedConceptId}>상세 조회</button>
                <button onClick={handleDeletePlan} disabled={isLoading || !planId}>삭제</button>
            </div>

            <br />

            <div>
                <h3>기획안 내용 편집</h3>
                <textarea
                    value={planContent}
                    onChange={(e) => setPlanContent(e.target.value)}
                    rows="10"
                    cols="50"
                    placeholder="기획안 내용을 입력하세요..."
                    disabled={isLoading || !selectedConceptId}
                ></textarea>
                <br />
                <button onClick={handleSavePlan} disabled={isLoading || !selectedConceptId}>저장</button>
            </div>

            <br />

            {message && <p style={{ color: 'blue' }}>{message}</p>}

            {plan && (
                <div>
                    <h3>조회된 기획안 정보</h3>
                    <p>ID: {plan.planId}</p>
                    <p>상태: {plan.status}</p>
                    <p>문서 URL: {plan.planDocUrl || '없음'}</p>
                </div>
            )}
        </div>
    );
}

export default PlanManager;