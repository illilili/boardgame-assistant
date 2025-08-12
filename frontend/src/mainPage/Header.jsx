import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyPageInfo } from '../api/auth.js';

// 메시지 알림 컴포넌트 (로그아웃, 로그인 성공/실패 등)
const CustomAlert = ({ message, type }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg text-white ${bgColor}`}>
            {message}
        </div>
    );
};

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
    const [userName, setUserName] = useState('');
    const [alertMessage, setAlertMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('accessToken');
            setIsLoggedIn(!!token);
            if (token) {
                fetchUserName();
            } else {
                setUserName('');
            }
        };

        const fetchUserName = async () => {
            try {
                const data = await getMyPageInfo();
                setUserName(data.userName);
            } catch (error) {
                console.error("사용자 정보 불러오기 실패:", error);
                handleLogout(false); // 오류 발생 시 메시지 없이 로그아웃
            }
        };

        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus);
        
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    const handleLogout = (showAlert = true) => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        setUserName('');
        
        if (showAlert) {
            setAlertMessage({ text: '로그아웃되었습니다.', type: 'success' });
            setTimeout(() => {
                setAlertMessage({ text: '', type: '' });
                navigate('/login');
            }, 2000); 
        } else {
            navigate('/login');
        }
    };

    return (
        <header className="minimalist-header">
            <div className="logo-minimalist">BOARD.CO</div>
            
            <nav className="main-nav">
                <Link to="/plan">기획</Link>
                <Link to="/development">개발</Link>
                <Link to="/publish">출판</Link>
                <Link to="/team">팀</Link>
                {isLoggedIn ? (
                    <>
                        <a href="#" onClick={() => handleLogout(true)} className="logout-link">로그아웃</a>
                    </>
                ) : (
                    <Link to="/login" className="login-link">로그인</Link>
                )}
            </nav>
            {alertMessage.text && (
                <CustomAlert message={alertMessage.text} type={alertMessage.type} />
            )}
            <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </header>
    );
};

export default Header;
