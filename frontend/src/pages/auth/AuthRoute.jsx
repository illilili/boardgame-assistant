import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
//   console.log("AuthRoute 실행됨");
  const isLoggedIn = !!localStorage.getItem("accessToken");
  console.log("로그인 상태:", isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/landing" />;
};

export default AuthRoute;
