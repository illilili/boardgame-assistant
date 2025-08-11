// src/plan/SubmissionPage.jsx (수정된 최종본)

import React, { useState, useEffect } from 'react';
import { getMyProjects, getAllConcepts, submitPlan } from '../api/auth';
import './SubmissionPage.css';

const SubmissionPage = () => {
    const [projectList, setProjectList] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [planId, setPlanId] = useState('');
    
    const [submissionFile, setSubmissionFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getMyProjects();
                setProjectList(data);
                if (data.length > 0) {
                    setSelectedProjectId(data[0].projectId.toString());
                }
            } catch (err) {
                setError('프로젝트 목록을 불러올 수 없습니다.');
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchAllConcepts = async () => {
            try {
                const data = await getAllConcepts(); 
                setConceptList(data);
            } catch (err) {
                setError('컨셉 목록을 불러올 수 없습니다.');
            }
        };
        fetchAllConcepts();
    }, []);

    useEffect(() => {
        if (!selectedProjectId || conceptList.length === 0) {
            setFilteredConceptList([]);
            setPlanId('');
            return;
        }
        
        // ✨ 여기가 수정된 부분입니다!
        // 1. 선택된 프로젝트 ID와 일치하는 컨셉만 필터링
        // 2. 기획안 ID (planId)가 존재하는 컨셉만 다시 필터링
        const conceptsForProjectWithPlan = conceptList.filter(c => 
            c.project && c.project.id === parseInt(selectedProjectId) && c.planId
        );
        
        setFilteredConceptList(conceptsForProjectWithPlan.sort((a, b) => b.conceptId - a.conceptId));

        if (conceptsForProjectWithPlan.length > 0) {
            setPlanId(conceptsForProjectWithPlan[0].conceptId.toString());
        } else {
            setPlanId('');
        }
    }, [selectedProjectId, conceptList]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setSubmissionFile(e.target.files[0]);
            setSuccessMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!planId || !submissionFile) {
            setError('제출할 기획안과 파일을 모두 선택해야 합니다.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const result = await submitPlan(planId, submissionFile);
            console.log(result);
            setSuccessMessage('기획안이 성공적으로 제출되었습니다!');
        } catch (err) {
            setError(`제출 실패: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="submission-page-container">
            <div className="submission-form-wrapper">
                <header className="submission-header">
                    <h1>기획안 최종 제출</h1>
                    <p>제출할 프로젝트와 기획안을 선택하고, 최종 문서를 업로드하세요.</p>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="project-select">프로젝트 선택</label>
                        <select
                            id="project-select"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            required
                        >
                            {projectList.length === 0 && <option disabled>로딩 중...</option>}
                            {projectList.map((project) => (
                                <option key={project.projectId} value={project.projectId}>
                                    {project.projectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="plan-select">기획안 선택</label>
                        <select
                            id="plan-select"
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                            disabled={filteredConceptList.length === 0}
                            required
                        >
                            {filteredConceptList.length === 0 ? (
                                <option disabled>-- 제출할 기획안이 없습니다 --</option>
                            ) : (
                                filteredConceptList.map(concept => (
                                    <option key={concept.conceptId} value={concept.conceptId}>
                                        ID: {concept.conceptId} - {concept.theme}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="submissionFile">제출할 기획서 파일 (.md, .docx 등)</label>
                        <input type="file" id="submissionFile" onChange={handleFileChange} required />
                    </div>

                    <button type="submit" className="primary-button" disabled={isSubmitting || !planId || !submissionFile}>
                        {isSubmitting ? "제출 중..." : "최종 제출하기"}
                    </button>
                    
                    {error && <p className="error-message">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default SubmissionPage;