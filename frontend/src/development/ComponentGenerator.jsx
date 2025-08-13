// 파일 위치: src/ComponentGenerator.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// auth.js 파일에서 API 함수들을 import 합니다.
import { getCardPreview, generateCardText, generateCardImage } from '../api/develop';
import './ComponentGenerator.css';

function ComponentGenerator() {
    const { contentId } = useParams();

    const [previewData, setPreviewData] = useState(null);
    const [formData, setFormData] = useState({ name: '', effect: '', description: '' });
    const [generatedText, setGeneratedText] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!contentId) return;

        setPreviewData(null);
        setFormData({ name: '', effect: '', description: '' });
        setGeneratedText('');
        setGeneratedImageUrl('');
        setError('');

        const fetchPreview = async () => {
            try {
                // API 호출: 카드 미리보기 데이터 가져오기
                const data = await getCardPreview(contentId);
                setPreviewData(data);
                setFormData({
                    name: data.name || '',
                    effect: data.effect || '',
                    description: data.description || '',
                });
            } catch (err) {
                setError('카드 미리보기 정보를 불러오는 데 실패했습니다.');
                console.error(err);
            }
        };
        fetchPreview();
    }, [contentId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTextGenerate = async () => {
        setIsLoadingText(true);
        setError('');
        try {
            // API 호출: 카드 문구 생성
            const requestData = { contentId: Number(contentId), ...formData };
            const response = await generateCardText(requestData);
            const resultText = response.generatedTexts[0]?.text || '생성된 텍스트가 없습니다.';
            setGeneratedText(resultText);
        } catch (err) {
            setError(`텍스트 생성 실패: ${err.message}`);
        } finally {
            setIsLoadingText(false);
        }
    };

    const handleImageGenerate = async () => {
        setIsLoadingImage(true);
        setError('');
        try {
            // API 호출: 카드 이미지 생성
            const requestData = { contentId: Number(contentId), ...formData };
            const response = await generateCardImage(requestData);
            const resultUrl = response.generatedImages[0]?.imageUrl || '';
            setGeneratedImageUrl(resultUrl);
        } catch (err) {
            setError(`이미지 생성 실패: ${err.message}`);
        } finally {
            setIsLoadingImage(false);
        }
    };

    return (
        <div className="card-generator-container">
            <h2>카드 콘텐츠 생성 (ID: {contentId})</h2>

            {previewData && (
                <div className="preview-section">
                    <p><strong>테마:</strong> {previewData.theme}</p>
                    <p><strong>스토리:</strong> {previewData.storyline}</p>
                </div>
            )}

            <div className="generator-layout">
                <div className="form-column">
                    <h3>카드 정보 입력</h3>
                    <div className="form-group">
                        <label htmlFor="name">카드 이름</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="effect">효과</label>
                        <textarea id="effect" name="effect" value={formData.effect} onChange={handleInputChange} rows="4"></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">설명 또는 아트 컨셉</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="4"></textarea>
                    </div>
                    <div className="button-group">
                        <button onClick={handleTextGenerate} disabled={isLoadingText || isLoadingImage}>
                            {isLoadingText ? '텍스트 생성 중...' : 'AI 문구 생성'}
                        </button>
                        <button onClick={handleImageGenerate} disabled={isLoadingText || isLoadingImage}>
                            {isLoadingImage ? '이미지 생성 중...' : 'AI 이미지 생성'}
                        </button>
                    </div>
                </div>

                <div className="result-column">
                    <h3>생성 결과</h3>
                    <div className="result-box">
                        <h4>생성된 문구</h4>
                        <pre className="text-result">{generatedText || '아직 생성된 문구가 없습니다.'}</pre>
                    </div>
                    <div className="result-box">
                        <h4>생성된 이미지</h4>
                        <div className="image-result">
                            {generatedImageUrl ? (
                                <img src={generatedImageUrl} alt="Generated Card" />
                            ) : (
                                <p>아직 생성된 이미지가 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default ComponentGenerator;